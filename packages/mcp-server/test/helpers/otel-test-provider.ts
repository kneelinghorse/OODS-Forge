import { trace } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
  type ReadableSpan,
} from '@opentelemetry/sdk-trace-node';

export type InstalledOtelTestProvider = {
  exporter: InMemorySpanExporter;
  provider: BasicTracerProvider;
  getFinishedSpans: () => ReadableSpan[];
  reset: () => void;
  uninstall: () => Promise<void>;
};

export function installOtelTestProvider(): InstalledOtelTestProvider {
  const exporter = new InMemorySpanExporter();
  const provider = new BasicTracerProvider();
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  trace.disable();
  provider.register();

  return {
    exporter,
    provider,
    getFinishedSpans: () => exporter.getFinishedSpans(),
    reset: () => exporter.reset(),
    uninstall: async () => {
      exporter.reset();
      await provider.shutdown();
      trace.disable();
    },
  };
}
