import { Injectable } from '@angular/core';

import { ChatMessage } from '../models/chat';

/**
 * Plain text export of what the customer can see. Not the orchestrator's transcript endpoint:
 * that one includes intent names and confidence scores which Legal did not want in a file a
 * customer downloads (IRIS-0702). The endpoint still exists for support tooling.
 *
 * Text, not PDF. The PDF ask (IRIS-0715) is open and has been since 2023.
 */
@Injectable()
export class TranscriptExportService {
  render(messages: ChatMessage[], startedAt: Date | null, sessionId: string | null): string {
    const lines: string[] = [];
    lines.push('Meridian Trust Bank - Iris conversation');
    lines.push(`Started: ${(startedAt ?? new Date()).toISOString()}`);
    if (sessionId) {
      lines.push(`Reference: ${sessionId}`);
    }
    lines.push('');
    for (const m of messages) {
      if (m.failed) {
        continue;
      }
      lines.push(`[${m.at.toISOString()}] ${label(m.role)}: ${m.text}`);
      for (const row of flattenData(m.data)) {
        lines.push(`    ${row}`);
      }
    }
    lines.push('');
    lines.push('Iris is a virtual assistant. This transcript is provided for your records and is not advice.');
    return lines.join('\n') + '\n';
  }

  download(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Safari needs the URL to outlive the click by a tick (IRIS-0733).
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  filenameFor(now: Date = new Date()): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `iris-conversation-${y}${m}${d}.txt`;
  }
}

function label(role: ChatMessage['role']): string {
  switch (role) {
    case 'customer':
      return 'You';
    case 'assistant':
      return 'Iris';
    case 'system':
      return 'Notice';
  }
}

/**
 * Intent payloads are whatever bff-retail returned. We do not know the shape, so: objects become
 * "key: value" rows, arrays of objects become one row per element, and anything else is stringified.
 * Balances and transactions both come out readable; that is the extent of the design.
 */
export function flattenData(data: unknown): string[] {
  if (data === undefined || data === null) {
    return [];
  }
  if (Array.isArray(data)) {
    return data.map((item) => (isRecord(item) ? summariseRecord(item) : String(item)));
  }
  if (isRecord(data)) {
    return Object.keys(data).map((k) => {
      const v = data[k];
      return `${k}: ${isRecord(v) || Array.isArray(v) ? JSON.stringify(v) : String(v)}`;
    });
  }
  return [String(data)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function summariseRecord(record: Record<string, unknown>): string {
  return Object.keys(record)
    .map((k) => `${k}=${isRecord(record[k]) || Array.isArray(record[k]) ? JSON.stringify(record[k]) : String(record[k])}`)
    .join(', ');
}
