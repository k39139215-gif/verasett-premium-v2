import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { figmaPaths, figmaSources } from './figma-paths';
import { Icon, type CanonicalIconName } from './icons';

interface IconProvenance {
  name: CanonicalIconName;
  filename: string;
  family: string;
  node: string;
  sha256: string;
  sourceId: string;
}

const iconDirectory = resolve(process.cwd(), 'src/components/icons');
const provenance = JSON.parse(readFileSync(resolve(iconDirectory, 'provenance.json'), 'utf8').replace(/^\uFEFF/, '')) as IconProvenance[];
const shapeSelector = 'path, rect, circle, ellipse, line, polygon, polyline';
const geometryAttributes = ['d', 'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'x1', 'x2', 'y1', 'y2', 'points', 'transform', 'fill-rule', 'clip-rule'];

function parseSvg(markup: string) {
  const parsed = new DOMParser().parseFromString(markup.replace(/^\uFEFF/, ''), 'image/svg+xml');
  expect(parsed.querySelector('parsererror')).toBeNull();
  return parsed;
}

function geometry(document: Document) {
  return [...document.querySelectorAll(shapeSelector)].map(shape => ({
    tag: shape.tagName,
    attributes: Object.fromEntries(geometryAttributes
      .filter(attribute => shape.hasAttribute(attribute))
      .map(attribute => [attribute, shape.getAttribute(attribute)])),
  }));
}

function expectPassiveSvg(document: Document) {
  expect(document.querySelector('script, foreignObject, image, use, a, style, animate, animateTransform, set')).toBeNull();
  for (const element of document.querySelectorAll('*')) {
    expect(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']).toContain(element.tagName);
    for (const attribute of element.attributes) {
      expect(attribute.name).not.toMatch(/^on/i);
      expect(attribute.name).not.toMatch(/^(href|xlink:href|src)$/i);
      expect(attribute.value).not.toMatch(/url\s*\(|javascript:/i);
    }
  }
}

describe('Figma export source integrity', () => {
  it('maps all supported icon keys to retained Figma exports', () => {
    const names = provenance.map(icon => icon.name).sort();
    expect(names).toHaveLength(43);
    expect(new Set(names).size).toBe(43);
    expect(new Set(provenance.map(icon => icon.sha256)).size).toBe(41);
    expect(Object.keys(figmaPaths).sort()).toEqual(names);
    expect(Object.keys(figmaSources).sort()).toEqual(names);
    expect(readdirSync(resolve(iconDirectory, 'source-svg')).sort()).toEqual(provenance.map(icon => icon.filename).sort());
    const wrapper = readFileSync(resolve(iconDirectory, 'icons.tsx'), 'utf8');
    expect(wrapper).not.toMatch(/existing-local|const iconPaths|<path|<circle|<rect/);
  });

  it.each(provenance)('$name retains source bytes, geometry, and node identity', icon => {
    const raw = readFileSync(resolve(iconDirectory, 'source-svg', icon.filename));
    expect(createHash('sha256').update(raw).digest('hex')).toBe(icon.sha256);

    const source = parseSvg(raw.toString('utf8'));
    const generated = parseSvg(renderToStaticMarkup(<svg>{figmaPaths[icon.name]}</svg>));
    const rendered = parseSvg(renderToStaticMarkup(<Icon name={icon.name} />));
    expect(geometry(source).length).toBeGreaterThan(0);
    expect(geometry(generated)).toEqual(geometry(source));
    expect(geometry(rendered)).toEqual(geometry(source));
    expect(rendered.documentElement.getAttribute('viewBox')).toBe(source.documentElement.getAttribute('viewBox'));
    expect(figmaSources[icon.name]).toBe(icon.sourceId);
    expect(icon.sourceId).toMatch(new RegExp(`^figma:${icon.family}:${icon.node}`));
    expect(rendered.documentElement.getAttribute('data-icon-source')).toBe(figmaSources[icon.name]);

    expectPassiveSvg(source);
    expectPassiveSvg(generated);
    for (const shape of generated.querySelectorAll('[fill], [stroke]')) {
      for (const attribute of ['fill', 'stroke']) {
        if (shape.hasAttribute(attribute)) expect(['currentColor', 'none']).toContain(shape.getAttribute(attribute));
      }
    }
  });

  it('prevents inherited outlines on the filled folder export', () => {
    const rendered = parseSvg(renderToStaticMarkup(<Icon name="folder" strokeWidth={3} />));
    const group = rendered.querySelector('svg > g');
    expect(group?.getAttribute('stroke')).toBe('none');
    expect(group?.querySelectorAll('path')).toHaveLength(3);
    for (const path of group?.querySelectorAll('path') ?? []) {
      expect(path.getAttribute('fill')).toBe('currentColor');
      expect(path.hasAttribute('stroke')).toBe(false);
    }
  });
});
