import { ChatMessage } from '../models/chat';
import { flattenData, TranscriptExportService } from './transcript-export.service';

describe('TranscriptExportService', () => {
  const service = new TranscriptExportService();
  const at = new Date('2024-03-01T10:00:00Z');

  it('renders visible turns, skips failed ones, includes the reference and the disclaimer', () => {
    const messages: ChatMessage[] = [
      { id: 'm1', role: 'assistant', text: 'Hi', at },
      { id: 'm2', role: 'customer', text: 'lost', at, failed: true },
      { id: 'm3', role: 'customer', text: 'balance', at },
      { id: 'm4', role: 'assistant', text: 'Here you go', at, data: { available: 12.5, currency: 'USD' } },
    ];
    const out = service.render(messages, at, 'sess-9');
    expect(out).toContain('Reference: sess-9');
    expect(out).toContain('Iris: Hi');
    expect(out).not.toContain('lost');
    expect(out).toContain('You: balance');
    expect(out).toContain('    available: 12.5');
    expect(out).toContain('virtual assistant');
  });

  it('names the file by date', () => {
    expect(service.filenameFor(new Date(2024, 0, 5))).toBe('iris-conversation-20240105.txt');
  });

  it('flattens arrays of records one row per element', () => {
    expect(flattenData([{ date: '2024-01-01', amount: -4.5 }, { date: '2024-01-02', amount: 20 }])).toEqual([
      'date=2024-01-01, amount=-4.5',
      'date=2024-01-02, amount=20',
    ]);
    expect(flattenData(undefined)).toEqual([]);
    expect(flattenData('plain')).toEqual(['plain']);
  });
});
