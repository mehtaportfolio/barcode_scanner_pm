import { randomUUID } from 'node:crypto';

type ContainerRecord = {
  id: string;
  container_number: string;
  status: string;
  created_by: string | null;
  closed_by: string | null;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
};

type BarcodeRecord = {
  id: string;
  container_id: string;
  barcode: string;
  scanned_by: string | null;
  scanned_at: string;
  created_at: string;
};

const containers = new Map<string, ContainerRecord>();
const barcodeScans = new Map<string, BarcodeRecord>();

function nowIso() {
  return new Date().toISOString();
}

function sortByCreatedAtDesc<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)));
}

function sortByScannedAtDesc<T extends { scanned_at: string }>(items: T[]) {
  return [...items].sort((a, b) => Number(new Date(b.scanned_at)) - Number(new Date(a.scanned_at)));
}

export const fallbackStore = {
  async createContainer(containerNumber: string) {
    const existing = Array.from(containers.values()).find(
      (item) => item.container_number === containerNumber && item.status === 'OPEN',
    );

    if (existing) {
      return {
        data: null,
        error: { message: 'Container already exists and is open.', statusCode: 409 },
      };
    }

    const record: ContainerRecord = {
      id: randomUUID(),
      container_number: containerNumber,
      status: 'OPEN',
      created_by: null,
      closed_by: null,
      created_at: nowIso(),
      closed_at: null,
      updated_at: nowIso(),
    };

    containers.set(record.id, record);

    return {
      data: {
        id: record.id,
        container_number: record.container_number,
      },
      error: null,
    };
  },

  async findOpenContainersByNumber(containerNumber: string) {
    const data = Array.from(containers.values()).filter(
      (item) => item.container_number === containerNumber && item.status === 'OPEN',
    );

    return { data, error: null };
  },

  async findAllContainers() {
    return { data: sortByCreatedAtDesc(Array.from(containers.values())), error: null };
  },

  async findContainerById(id: string) {
    return { data: containers.get(id) ?? null, error: null };
  },

  async closeContainer(id: string) {
    const existing = containers.get(id);

    if (!existing) {
      return {
        data: null,
        error: { message: 'Container not found.', statusCode: 404 },
      };
    }

    const updated: ContainerRecord = {
      ...existing,
      status: 'CLOSED',
      closed_at: nowIso(),
      closed_by: null,
      updated_at: nowIso(),
    };

    containers.set(id, updated);

    return { data: updated, error: null };
  },

  async createBarcode(containerId: string, barcode: string) {
    const record: BarcodeRecord = {
      id: randomUUID(),
      container_id: containerId,
      barcode,
      scanned_by: null,
      scanned_at: nowIso(),
      created_at: nowIso(),
    };

    barcodeScans.set(record.id, record);

    return { data: { id: record.id }, error: null };
  },

  async findBarcodeByContainerAndBarcode(containerId: string, barcode: string) {
    const data = Array.from(barcodeScans.values()).filter(
      (item) => item.container_id === containerId && item.barcode === barcode,
    );

    return { data: data.slice(0, 1), error: null };
  },

  async countBarcodesByContainerId(containerId: string) {
    const count = Array.from(barcodeScans.values()).filter((item) => item.container_id === containerId).length;

    return { count, error: null };
  },

  async findBarcodesByContainerId(containerId: string) {
    const data = sortByScannedAtDesc(
      Array.from(barcodeScans.values()).filter((item) => item.container_id === containerId),
    );

    return { data, error: null };
  },
};
