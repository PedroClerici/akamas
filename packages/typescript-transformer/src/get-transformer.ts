import ts from 'typescript';
import { type TransformerConfig, useConfig, useProgram } from '@/context.ts';
import { transformSystems } from '@/systems/transform-systems.ts';
import { pipe } from '@/utils/pipe.ts';
import { shouldIgnoreNode } from '@/utils/transform.ts';

const visitors = pipe(
  transformSystems,
  // transformIterators,
);

export function getTransformer(config?: TransformerConfig) {
  useConfig.set(config);
  return function transformer(
    program: ts.Program,
  ): ts.TransformerFactory<ts.SourceFile> {
    useProgram.set(program);
    return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
      function visit(node: ts.Node): ts.Node | ts.NodeArray<any> {
        if (shouldIgnoreNode(node)) {
          return node;
        }

        const result = visitors(node);
        if (Array.isArray(result)) {
          // If we returned a node array, we have to handle visitation
          // ourselves. We must not re-visit nodes that insert new
          // nodes to avoid stack overflow.
          return ts.factory.createNodeArray(
            result.map((newNode) => ts.visitEachChild(newNode, visit, context)),
          );
        }
        return ts.visitEachChild(result, visit, context);
      }

      return ts.visitNode(file, visit)! as ts.SourceFile;
    };
  };
}
