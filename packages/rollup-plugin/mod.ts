import {
  getTransformer,
  type TransformerConfig,
} from '@akamas/typescript-transformer';
import { createFilter } from '@rollup/pluginutils';
import type { Plugin } from 'rollup';
import ts from 'typescript';

type AkamasPluginConfig = {
  include?: string | string[];
  exclude?: string | string[];
} & TransformerConfig;

export function akamas({
  include = 'src/**/*.ts',
  exclude,
  ...transformerConfig
}: AkamasPluginConfig = {}): Plugin {
  const filter = createFilter(include, exclude);
  const createTransformer = getTransformer(transformerConfig);
  const fileIds = new Set<string>();

  const printer = ts.createPrinter();
  let program: ts.Program;
  let transformer: ts.TransformerFactory<any>;

  return {
    name: '@akamas/rollup-plugin',
    version: '0.1.0',
    enforce: 'pre',
    transform(code, id) {
      if (!filter(id)) {
        return code;
      }
      if (fileIds.has(id) || program?.getSourceFile(id) === undefined) {
        program = ts.createProgram([id, ...fileIds], {}, undefined, program);
        transformer = createTransformer(program);
      }
      fileIds.add(id);

      const file = program.getSourceFile(id)!;
      const result = ts.transform(file, [transformer]);
      return printer.printFile(result.transformed[0]);
    },
  } as Plugin;
}
