export type EntityType = 'agents' | 'factories';

const keyFor = (entity: EntityType) => `dairyweb_profile_pics_${entity}`;

type ProfilePicMap = Record<string, string>;

function readMap(entity: EntityType): ProfilePicMap {
    try {
        const raw = localStorage.getItem(keyFor(entity));
        if (!raw) return {};
        const parsed = JSON.parse(raw) as unknown;
        return typeof parsed === 'object' && parsed !== null ? parsed as ProfilePicMap : {};
    } catch {
        return {};
    }
}

function writeMap(entity: EntityType, map: ProfilePicMap) {
    localStorage.setItem(keyFor(entity), JSON.stringify(map));
}

export function getEntityProfilePic(entity: EntityType, entityId: string): string | null {
    const map = readMap(entity);
    return map[entityId] || null;
}

export function setEntityProfilePic(entity: EntityType, entityId: string, dataUrl: string) {
    const map = readMap(entity);
    map[entityId] = dataUrl;
    writeMap(entity, map);
}

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read selected file'));
        reader.readAsDataURL(file);
    });
}
