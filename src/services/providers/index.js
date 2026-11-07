// Provider registry.
//
// The processor asks this registry for a provider by id. Today only the
// deterministic demo provider is registered. A future local Ollama provider
// will implement the same { id, process(request) } shape and slot in here
// with no changes to the processor or the UI.

import demoProvider from './demoProvider.js'
import { Providers } from '../processorTypes.js'

const registry = {
  [Providers.DEMO]: demoProvider,
  // [Providers.OLLAMA]: ollamaProvider,  // added in a later milestone
}

// Return the provider for the given id, or null if it is not registered.
export function getProvider(id) {
  return registry[id] ?? null
}
