import { createFunctionHandler } from './shared/functionHandler.ts';

Deno.serve(createFunctionHandler((name) => Deno.env.get(name)));
