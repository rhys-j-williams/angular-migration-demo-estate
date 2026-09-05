import { chain, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema } from './schema';

const THEME_IMPORT = `@use '@meridian/canopy-ui/themes' as canopy;\n@include canopy.theme();\n`;
const THEME_IMPORT_LIGHT = `@use '@meridian/canopy-ui/themes' as canopy;\n@include canopy.theme($include-dark: false, $include-high-contrast: false);\n`;
const SPRITE_ASSET = {
  glob: 'canopy-sprite.svg',
  input: './node_modules/@meridian/canopy-ui/icons',
  output: '/assets/canopy'
};

interface WorkspaceProject {
  root: string;
  sourceRoot?: string;
  architect?: {
    build?: {
      options?: {
        styles?: (string | { input: string })[];
        assets?: (string | Record<string, unknown>)[];
      };
    };
  };
}

interface Workspace {
  defaultProject?: string;
  projects: Record<string, WorkspaceProject>;
}

function readWorkspace(tree: Tree): Workspace {
  const raw = tree.read('angular.json');
  if (!raw) {
    throw new SchematicsException('Could not find angular.json. Canopy ng-add only supports Angular CLI workspaces.');
  }
  return JSON.parse(raw.toString('utf-8')) as Workspace;
}

function resolveProject(workspace: Workspace, name?: string): [string, WorkspaceProject] {
  const projectName = name || workspace.defaultProject || Object.keys(workspace.projects)[0];
  const project = workspace.projects[projectName];
  if (!project) {
    throw new SchematicsException(`Project "${projectName}" not found in angular.json.`);
  }
  return [projectName, project];
}

/** Adds the theme mixin to the project's global stylesheet, creating one if needed. */
export function addThemeToStyles(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workspace = readWorkspace(tree);
    const [, project] = resolveProject(workspace, options.project);
    const styles = project.architect?.build?.options?.styles || [];
    const first = styles.map(s => (typeof s === 'string' ? s : s.input)).find(s => /\.scss$/.test(s));
    const snippet = options.theme === 'light-only' ? THEME_IMPORT_LIGHT : THEME_IMPORT;

    if (!first) {
      const path = `${project.sourceRoot || project.root + '/src'}/styles.scss`;
      tree.create(path, snippet);
      context.logger.warn(`No SCSS stylesheet found for the project; created ${path}. Add it to the styles array.`);
      return tree;
    }
    const existing = tree.read(first)?.toString('utf-8') ?? '';
    if (existing.includes('@meridian/canopy-ui/themes')) {
      context.logger.info('Canopy theme already included, leaving styles.scss alone.');
      return tree;
    }
    tree.overwrite(first, snippet + '\n' + existing);
    return tree;
  };
}

/** Registers the icon sprite as an asset so MatIconRegistry can fetch it at runtime. */
export function addSpriteAsset(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.skipIconSprite) {
      return tree;
    }
    const workspace = readWorkspace(tree);
    const [, project] = resolveProject(workspace, options.project);
    const buildOptions = project.architect?.build?.options;
    if (!buildOptions) {
      context.logger.warn('Project has no build target; skipping the sprite asset.');
      return tree;
    }
    const assets = buildOptions.assets || (buildOptions.assets = []);
    const already = assets.some(a => typeof a !== 'string' && a['glob'] === SPRITE_ASSET.glob);
    if (!already) {
      assets.push(SPRITE_ASSET);
      tree.overwrite('angular.json', JSON.stringify(workspace, null, 2) + '\n');
    }
    return tree;
  };
}

/** Adds `cn-theme-light` to <body> so the tokens resolve before CnThemeService runs. */
export function addBodyClass(options: Schema): Rule {
  return (tree: Tree) => {
    const workspace = readWorkspace(tree);
    const [, project] = resolveProject(workspace, options.project);
    const indexPath = `${project.sourceRoot || project.root + '/src'}/index.html`;
    const html = tree.read(indexPath)?.toString('utf-8');
    if (!html || html.includes('cn-theme-')) {
      return tree;
    }
    tree.overwrite(indexPath, html.replace(/<html([^>]*)>/, '<html$1 class="cn-theme-light">'));
    return tree;
  };
}

export function ngAdd(options: Schema): Rule {
  return chain([
    addThemeToStyles(options),
    addSpriteAsset(options),
    addBodyClass(options),
    (_tree: Tree, context: SchematicContext) => {
      context.addTask(new NodePackageInstallTask());
      context.logger.info('Canopy added. Import CnCoreModule.forRoot() and CnIconModule in your CoreModule.');
    }
  ]);
}
