// Provider registry.
//
// The processor asks this registry for a provider by id. Today only the
// deterministic demo provider is registered. A future provider (local Ollama
// or a network-backed one) will implement the same async
// { id, process(request): Promise } shape and slot in here with no changes to
// the processor or the UI.

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
