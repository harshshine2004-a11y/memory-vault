import * as THREE from 'three';

class TextureCacheManager {
  private cache = new Map<string, THREE.Texture>();
  private loader = new THREE.TextureLoader();

  public getTexture(url: string): THREE.Texture {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const texture = this.loader.load(url);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.cache.set(url, texture);
    return texture;
  }

  public disposeTexture(url: string) {
    if (this.cache.has(url)) {
      const texture = this.cache.get(url);
      if (texture) {
        texture.dispose();
      }
      this.cache.delete(url);
    }
  }

  public clearAll() {
    this.cache.forEach((texture) => {
      texture.dispose();
    });
    this.cache.clear();
  }
}

export const textureCacheManager = new TextureCacheManager();

export function disposeThreeResource(object: THREE.Object3D) {
  if (!object) return;

  object.traverse((child: any) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat: THREE.Material) => mat.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
