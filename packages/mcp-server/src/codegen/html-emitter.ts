import { renderTree } from '../render/tree-renderer.js';
import { renderDocument } from '../render/document.js';
import type { UiElement, UiSchema } from '../schemas/generated.js';
import type { CodegenOptions, CodegenResult } from './types.js';
import { resolveChildContent, resolveFieldProps, resolveFrameworkRecipeProps } from './binding-utils.js';
import { runPreEmit } from './pre-emit.js';
import { normalizeSchemaForFramework } from './framework-normalization.js';
import { executeCompositionDirectives } from './composition-directives.js';

/**
 * Inject {{fieldName}} placeholder text into leaf nodes with field bindings.
 * Mutates a cloned schema so the tree renderer picks up placeholder content.
 */
function injectFieldPlaceholders(schema: UiSchema): UiSchema {
  const objectSchema = schema.objectSchema;
  if (!objectSchema || Object.keys(objectSchema).length === 0) return schema;

  const cloned = structuredClone(schema);
  const walk = (node: UiElement): void => {
    // Labelled's header fields use the HTML emitter's existing visible
    // placeholders, while framework emitters read the actual object data.
    if (node.component === 'CardHeader') {
      const recipe = resolveFrameworkRecipeProps(node, objectSchema);
      node.props = { ...node.props };
      for (const prop of recipe.consumedProps) delete node.props[prop];
      for (const { targetProp, expression } of recipe.bindings) {
        node.props[targetProp] = `[${expression}]`;
      }
    }
    // Enrich props from objectSchema metadata (labels, placeholders, required, options, type)
    const enriched = resolveFieldProps(node, objectSchema);
    if (enriched) {
      node.props = { ...node.props };
      for (const [key, value] of Object.entries(enriched)) {
        if ((node.props as Record<string, unknown>)[key] === undefined) {
          (node.props as Record<string, unknown>)[key] = value;
        }
      }
    }

    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    if (!hasChildren) {
      const content = resolveChildContent(node, objectSchema);
      if (content) {
        if (content.isChildren) {
          // Use data-bind attribute + human-readable placeholder text
          node.props = {
            ...node.props,
            // CardHeader scalar field content overrides its title aliases in
            // React/Vue too, including a title supplied by recipe metadata.
            [node.component === 'CardHeader' ? 'title' : 'text']: `[${content.fieldName}]`,
            'data-bind': content.fieldName,
          };
        } else if (content.propName) {
          node.props = { ...node.props, [content.propName]: `[${content.fieldName}]`, 'data-bind': `${content.propName}:${content.fieldName}` };
        }
      }
    }
    node.children?.forEach(walk);
  };
  cloned.screens.forEach(walk);
  return cloned;
}

/**
 * HTML emitter — delegates to the existing repl.render document pipeline.
 * Produces a self-contained HTML document from the UiSchema.
 * Injects {{fieldName}} placeholders for field-bound components.
 */
export function emit(schema: UiSchema, options: CodegenOptions): CodegenResult {
  const warnings: CodegenResult['warnings'] = [];

  try {
    const expandedSchema = executeCompositionDirectives(schema);
    const ctx = runPreEmit(expandedSchema, { options });
    const normalizedSchema = normalizeSchemaForFramework(ctx.schema, 'html');
    const processedSchema = injectFieldPlaceholders(normalizedSchema);
    const screenHtml = renderTree(processedSchema);
    const html = renderDocument({ screenHtml, schema: processedSchema });

    return {
      status: 'ok',
      framework: 'html',
      code: html,
      fileExtension: '.html',
      imports: [],
      warnings,
    };
  } catch (error) {
    return {
      status: 'error',
      framework: 'html',
      code: '',
      fileExtension: '.html',
      imports: [],
      warnings,
      errors: [
        {
          code: 'OODS-S006',
          message: `HTML rendering failed: ${(error as Error).message}`,
        },
      ],
    };
  }
}
