import ts from 'typescript';
import { useTypeChecker } from '@/context.ts';
import type { Rule } from '@/rule-engine.ts';

type Visitor<T extends ts.Node> = (node: T) => ts.Node | ts.Node[];

export function createVisitor<T extends ts.Node>(
  rule: Rule<ts.Node, T>,
  visitor: Visitor<T>,
): (node: ts.Node) => ts.Node | ts.Node[] {
  return function filteredVisitor(node: ts.Node) {
    if (!rule(node)) {
      return node;
    }

    return visitor(node as any);
  } as any;
}

export function extractGeneric(typeNode: ts.TypeNode): string {
  if (ts.isArrayTypeNode(typeNode)) {
    return typeNode.elementType.getText();
  }

  if (
    ts.isTypeReferenceNode(typeNode) &&
    typeNode.typeArguments &&
    typeNode.typeArguments.length === 1
  ) {
    return typeNode.typeArguments[0].getText();
  }

  return '';
}

export function getOriginalDeclaration(
  node: ts.TypeReferenceNode,
  useExpression: boolean = false,
): ts.Declaration | undefined {
  const checker = useTypeChecker();
  const symbol = checker.getSymbolAtLocation(
    useExpression ? (node as any).expression : node.typeName,
  );
  const declaration = symbol?.declarations?.[0];
  if (
    declaration &&
    (ts.isImportDeclaration(declaration) || ts.isImportSpecifier(declaration))
  ) {
    return checker.getAliasedSymbol(symbol!).declarations![0];
  }
  return declaration;
}

const isExtendsClause = (clause: ts.HeritageClause) =>
  clause.token === ts.SyntaxKind.ExtendsKeyword;

export function getParentDeclaration(
  node: ts.ClassDeclaration,
): ts.ClassDeclaration | undefined {
  const extendClause = node.heritageClauses?.find(isExtendsClause);
  return extendClause
    ? (getOriginalDeclaration(extendClause.types[0] as any, true) as any)
    : undefined;
}

const IGNORE_TEXT = 'akamas-ignore';

export function shouldIgnoreNode(node: ts.Node): boolean {
  if (ts.isSourceFile(node)) {
    return false;
  }

  let willIgnore = false;
  try {
    const leadingComments =
      ts.getLeadingCommentRanges(node.getFullText(), 0) ?? [];

    for (const { kind, pos, end } of leadingComments) {
      if (
        kind === ts.SyntaxKind.SingleLineCommentTrivia ||
        kind === ts.SyntaxKind.MultiLineCommentTrivia
      ) {
        const commentText = node.getFullText().substring(pos, end);
        if (commentText.includes(IGNORE_TEXT)) {
          willIgnore = true;
        }
      }
    }
  } catch {
    willIgnore = false;
  }
  return willIgnore;
}
