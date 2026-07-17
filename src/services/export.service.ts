import ExcelJS from 'exceljs';
import { Response } from 'express';
import { supabase } from '../config/supabase';
import { fallbackStore } from '../utils/fallback-store';

const escapeSqlString = (value: string) => value.replace(/'/g, "''");

function buildCsvLine(values: Array<string | number | null | undefined>): string {
  return values
    .map((value) => {
      const text = String(value ?? '');
      return text.includes(',') || text.includes('"') || text.includes('\n')
        ? `"${text.replace(/"/g, '""')}"`
        : text;
    })
    .join(',');
}

async function buildWorkbook(rows: Array<Record<string, string | number | null | undefined>>, headers: Array<{ header: string; key: string; width: number }>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Container Scanner';
  workbook.lastModifiedBy = 'Container Scanner';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Container Barcodes');
  worksheet.columns = headers;

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  return workbook.xlsx.writeBuffer();
}

async function buildFallbackContainerExport(containerId: string, userId: string | undefined, format: 'csv' | 'excel') {
  const { data: rows } = await fallbackStore.findContainerBarcodeExportRows(containerId, userId);

  if (format === 'excel') {
    return buildWorkbook(
      rows.map((row: { barcode: string; scanned_at: string }) => ({
        containerNumber: '',
        barcodeValue: row.barcode,
        status: '',
      })),
      [
        { header: 'Container No', key: 'containerNumber', width: 24 },
        { header: 'Barcode Value', key: 'barcodeValue', width: 30 },
        { header: 'Status', key: 'status', width: 18 },
      ],
    );
  }

  const csvLines = ['Container No,Barcode Value,Status'];
  rows.forEach((row: { barcode: string; scanned_at: string }) => {
    csvLines.push(buildCsvLine(['', row.barcode, '']));
  });

  return Buffer.from(csvLines.join('\n'), 'utf8');
}

async function buildFallbackHistoryExport(userId: string | undefined, format: 'csv' | 'excel') {
  const { data: rows } = await fallbackStore.findAllBarcodeExportRows(userId);

  if (format === 'excel') {
    return buildWorkbook(
      rows.map((row: { container_number: string; barcode: string; status: string }) => ({
        containerNumber: row.container_number,
        barcodeValue: row.barcode,
        status: row.status,
      })),
      [
        { header: 'Container No', key: 'containerNumber', width: 24 },
        { header: 'Barcode Value', key: 'barcodeValue', width: 30 },
        { header: 'Status', key: 'status', width: 18 },
      ],
    );
  }

  const csvLines = ['Container No,Barcode Value,Status'];
  rows.forEach((row: { container_number: string; barcode: string; status: string }) => {
    csvLines.push(buildCsvLine([row.container_number, row.barcode, row.status]));
  });

  return Buffer.from(csvLines.join('\n'), 'utf8');
}

async function buildSupabaseContainerExport(containerId: string, userId: string | undefined, format: 'csv' | 'excel') {
  const { data: container, error: containerError } = await supabase
    .from('containers')
    .select('id, container_number, status, created_by')
    .eq('id', containerId)
    .maybeSingle();

  if (containerError) {
    throw containerError;
  }

  if (!container) {
    return format === 'excel'
      ? buildWorkbook([], [
          { header: 'Container No', key: 'containerNumber', width: 24 },
          { header: 'Barcode Value', key: 'barcodeValue', width: 30 },
          { header: 'Status', key: 'status', width: 18 },
        ])
      : Buffer.from('Container No,Barcode Value,Status\n', 'utf8');
  }

  if (userId && container.created_by && container.created_by !== userId) {
    return format === 'excel'
      ? buildWorkbook([], [
          { header: 'Container No', key: 'containerNumber', width: 24 },
          { header: 'Barcode Value', key: 'barcodeValue', width: 30 },
          { header: 'Status', key: 'status', width: 18 },
        ])
      : Buffer.from('Container No,Barcode Value,Status\n', 'utf8');
  }

  const { data: barcodes, error: barcodesError } = await supabase
    .from('barcode_scans')
    .select('barcode, scanned_at')
    .eq('container_id', containerId)
    .order('scanned_at', { ascending: true });

  if (barcodesError) {
    throw barcodesError;
  }

  const rows = (barcodes ?? []).map((row) => ({
    containerNumber: container.container_number,
    barcodeValue: row.barcode,
    status: container.status,
  }));

  if (format === 'excel') {
    return buildWorkbook(rows, [
      { header: 'Container No', key: 'containerNumber', width: 24 },
      { header: 'Barcode Value', key: 'barcodeValue', width: 30 },
      { header: 'Status', key: 'status', width: 18 },
    ]);
  }

  const csvLines = ['Container No,Barcode Value,Status'];
  rows.forEach((row) => {
    csvLines.push(buildCsvLine([row.containerNumber, row.barcodeValue, row.status]));
  });

  return Buffer.from(csvLines.join('\n'), 'utf8');
}

async function buildSupabaseHistoryExport(userId: string | undefined, format: 'csv' | 'excel') {
  let containersQuery = supabase
    .from('containers')
    .select('id, container_number, status, created_by')
    .order('created_at', { ascending: false });

  if (userId) {
    containersQuery = containersQuery.or(`created_by.eq.${userId},created_by.is.null`) as typeof containersQuery;
  }

  const { data: containers, error: containersError } = await containersQuery;

  if (containersError) {
    throw containersError;
  }

  const containerIds = (containers ?? []).map((container) => container.id);
  const { data: barcodes, error: barcodesError } = containerIds.length > 0
    ? await supabase
        .from('barcode_scans')
        .select('container_id, barcode')
        .in('container_id', containerIds)
        .order('scanned_at', { ascending: true })
    : { data: [], error: null };

  if (barcodesError) {
    throw barcodesError;
  }

  const rows = (containers ?? []).flatMap((container) => {
    const containerBarcodes = (barcodes ?? []).filter((barcode) => barcode.container_id === container.id);

    return containerBarcodes.map((barcode) => ({
      containerNumber: container.container_number,
      barcodeValue: barcode.barcode,
      status: container.status,
    }));
  });

  if (format === 'excel') {
    return buildWorkbook(rows, [
      { header: 'Container No', key: 'containerNumber', width: 24 },
      { header: 'Barcode Value', key: 'barcodeValue', width: 30 },
      { header: 'Status', key: 'status', width: 18 },
    ]);
  }

  const csvLines = ['Container No,Barcode Value,Status'];
  rows.forEach((row) => {
    csvLines.push(buildCsvLine([row.containerNumber, row.barcodeValue, row.status]));
  });

  return Buffer.from(csvLines.join('\n'), 'utf8');
}

export async function streamContainerBarcodeExport(
  containerId: string,
  userId: string | undefined,
  res: Response,
  format: 'csv' | 'excel' = 'csv',
): Promise<void> {
  try {
    const extension = format === 'excel' ? 'xlsx' : 'csv';
    const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv; charset=utf-8';

    const payload = await buildSupabaseContainerExport(containerId, userId, format);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${containerId.slice(0, 8)}-barcodes.${extension}"`);
    res.send(payload);
  } catch (error) {
    console.warn('Falling back to local export data for container export.', error);
    const extension = format === 'excel' ? 'xlsx' : 'csv';
    const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv; charset=utf-8';
    const payload = await buildFallbackContainerExport(containerId, userId, format);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${containerId.slice(0, 8)}-barcodes.${extension}"`);
    res.send(payload);
  }
}

export async function streamHistoryBarcodeExport(
  userId: string | undefined,
  res: Response,
  format: 'csv' | 'excel' = 'excel',
): Promise<void> {
  try {
    const payload = await buildSupabaseHistoryExport(userId, format);
    const contentType = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv; charset=utf-8';
    const fileName = format === 'excel' ? 'container-history-barcodes.xlsx' : 'container-history-barcodes.csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(payload);
  } catch (error) {
    console.warn('Falling back to local export data for history export.', error);
    const payload = await buildFallbackHistoryExport(userId, format);
    const contentType = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv; charset=utf-8';
    const fileName = format === 'excel' ? 'container-history-barcodes.xlsx' : 'container-history-barcodes.csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(payload);
  }
}
