import { barcodeRepository } from '../repositories/barcode.repository';
import { containerRepository } from '../repositories/container.repository';

interface CreateContainerInput {
  containerNumber: string;
}

interface AuthContext {
  userId?: string;
  role?: string;
}

export const containerService = {
  async create(data: CreateContainerInput) {
    const containerNumber = data.containerNumber.trim();

    if (!containerNumber) {
      const error = new Error('Container number is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: existingContainers, error: existingError } = await containerRepository.findOpenByNumber(containerNumber);

    if (existingError) {
      throw existingError;
    }

    if ((existingContainers ?? []).length > 0) {
      const error = new Error('Container already exists and is open.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const { data: createdContainer, error } = await containerRepository.create({ containerNumber });

    if (error) {
      throw error;
    }

    return {
      containerId: createdContainer?.id,
      containerNumber: createdContainer?.container_number,
    };
  },

  async list(authContext?: AuthContext) {
    const { data: containers, error } = await containerRepository.findAll();

    if (error) {
      throw error;
    }

    const filteredContainers = (containers ?? []).filter((container) => {
      if (!authContext?.userId || authContext.role === 'admin') {
        return true;
      }

      return container.created_by === authContext.userId || container.created_by === null;
    });

    const results = await Promise.all(
      filteredContainers.map(async (container) => {
        const { count, error: countError } = await barcodeRepository.countByContainerId(container.id);

        if (countError) {
          throw countError;
        }

        return {
          id: container.id,
          containerNumber: container.container_number,
          status: container.status,
          createdAt: container.created_at,
          closedAt: container.closed_at,
          totalScans: count ?? 0,
        };
      }),
    );

    return results;
  },

  async getById(id: string, authContext?: AuthContext) {
    const { data: container, error: containerError } = await containerRepository.findByIdForUser(id, authContext?.userId || '');

    if (containerError) {
      throw containerError;
    }

    if (!container) {
      const error = new Error('Container not found.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const { data: barcodes, error: barcodesError } = await barcodeRepository.findByContainerId(id);

    if (barcodesError) {
      throw barcodesError;
    }

    return {
      container: {
        id: container.id,
        containerNumber: container.container_number,
        status: container.status,
        createdAt: container.created_at,
        closedAt: container.closed_at,
      },
      barcodes: (barcodes ?? []).map((barcode) => ({
        id: barcode.id,
        barcode: barcode.barcode,
        scannedAt: barcode.scanned_at,
      })),
      scanCount: barcodes?.length ?? 0,
    };
  },

  async close(id: string, authContext?: AuthContext) {
    const { data: existingContainer, error: existingError } = await containerRepository.findByIdForUser(id, authContext?.userId || '');

    if (existingError) {
      throw existingError;
    }

    if (!existingContainer) {
      const error = new Error('Container not found or not accessible.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const { data: updatedContainer, error } = await containerRepository.close(id);

    if (error) {
      throw error;
    }

    return {
      id: updatedContainer?.id,
      status: updatedContainer?.status,
    };
  },

  async reopen(id: string, authContext?: AuthContext) {
    const { data: existingContainer, error: existingError } = await containerRepository.findByIdForUser(id, authContext?.userId || '');

    if (existingError) {
      throw existingError;
    }

    if (!existingContainer) {
      const error = new Error('Container not found or not accessible.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const { data: updatedContainer, error } = await containerRepository.reopen(id);

    if (error) {
      throw error;
    }

    return {
      id: updatedContainer?.id,
      status: updatedContainer?.status,
    };
  },

  async delete(id: string, authContext?: AuthContext) {
    const barcodeId = id?.toString().trim();

    if (!barcodeId) {
      const error = new Error('Container ID is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: container, error: containerError } = await containerRepository.findByIdForUser(barcodeId, authContext?.userId || '');

    if (containerError) {
      throw containerError;
    }

    if (!container) {
      const error = new Error('Container not found or not accessible.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const { error: barcodeDeleteError } = await barcodeRepository.deleteByContainerId(barcodeId);

    if (barcodeDeleteError) {
      throw barcodeDeleteError;
    }

    const { error } = await containerRepository.delete(barcodeId);

    if (error) {
      throw error;
    }

    return {
      id: barcodeId,
    };
  },
};
