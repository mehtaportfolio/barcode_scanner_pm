import { barcodeRepository } from '../repositories/barcode.repository';
import { containerRepository } from '../repositories/container.repository';

interface CreateBarcodeInput {
  containerId: string;
  barcode: string;
}

export const barcodeService = {
  async create(data: CreateBarcodeInput) {
    const containerId = data.containerId.trim();
    const barcode = data.barcode.trim();

    if (!containerId) {
      const error = new Error('Container ID is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    if (!barcode) {
      const error = new Error('Barcode is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: container, error: containerError } = await containerRepository.findById(containerId);

    if (containerError) {
      throw containerError;
    }

    if (!container) {
      const error = new Error('Container not found.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    if (container.status !== 'OPEN') {
      const error = new Error('Container is not open.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const { data: existing, error: duplicateError } = await barcodeRepository.findByContainerAndBarcode(containerId, barcode);

    if (duplicateError) {
      throw duplicateError;
    }

    if ((existing ?? []).length > 0) {
      const error = new Error('Barcode already scanned.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const { error } = await barcodeRepository.create({ containerId, barcode });

    if (error) {
      throw error;
    }

    const { count, error: countError } = await barcodeRepository.countByContainerId(containerId);

    if (countError) {
      throw countError;
    }

    return {
      scanCount: count ?? 0,
    };
  },

  async update(id: string, newBarcode: string) {
    const barcodeId = id?.toString().trim();

    if (!barcodeId) {
      const error = new Error('Barcode ID is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: existingBarcode, error: existingError } = await barcodeRepository.findById(barcodeId);

    if (existingError) {
      throw existingError;
    }

    if (!existingBarcode) {
      const error = new Error('Barcode not found.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const containerId = existingBarcode.container_id;

    const { data: container, error: containerError } = await containerRepository.findById(containerId);

    if (containerError) {
      throw containerError;
    }

    if (!container) {
      const error = new Error('Container not found.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    if (container.status !== 'OPEN') {
      const error = new Error('Container is not open.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const barcodeTrimmed = newBarcode.trim();
    if (!barcodeTrimmed) {
      const error = new Error('Barcode is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: duplicates, error: dupErr } = await barcodeRepository.findByContainerAndBarcode(containerId, barcodeTrimmed);

    if (dupErr) {
      throw dupErr;
    }

    if ((duplicates ?? []).length > 0 && duplicates[0].id !== barcodeId) {
      const error = new Error('Barcode already scanned.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const { data: updated, error } = await barcodeRepository.update(barcodeId, { barcode: barcodeTrimmed });

    if (error) {
      throw error;
    }

    return {
      id: updated?.id,
      barcode: updated?.barcode,
      scannedAt: updated?.scanned_at,
    };
  },

  async delete(id: string) {
    const barcodeId = id?.toString().trim();

    if (!barcodeId) {
      const error = new Error('Barcode ID is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: existingBarcode, error: existingError } = await barcodeRepository.findById(barcodeId);

    if (existingError) {
      throw existingError;
    }

    if (!existingBarcode) {
      const error = new Error('Barcode not found.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const containerId = existingBarcode.container_id;

    const { data: container, error: containerError } = await containerRepository.findById(containerId);

    if (containerError) {
      throw containerError;
    }

    if (!container) {
      const error = new Error('Container not found.');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const { error } = await barcodeRepository.delete(barcodeId);

    if (error) {
      throw error;
    }

    const { count, error: countError } = await barcodeRepository.countByContainerId(containerId);

    if (countError) {
      throw countError;
    }

    return {
      id: barcodeId,
      scanCount: count ?? 0,
    };
  },
};
