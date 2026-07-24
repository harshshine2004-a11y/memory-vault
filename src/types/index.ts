export type ThemeId = 
  | 'abyssal_ocean'
  | 'garden'
  | 'solar_system'
  | 'galaxy' 
  | 'ancient_library'
  | 'cyberpunk_city'
  | 'snow_mountain'
  | 'desert_oasis'
  | 'zen_garden'
  | 'fantasy_kingdom'
  | 'rainforest';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: string;
  bgType?: string;
  accentColor: string;
  particleColor: string;
  particleCount: number;
  nodeMaterial: 'glowing' | 'wireframe' | 'crystal' | 'gold' | 'glass' | 'parchment';
  lightIntensity: number;
  ambientLightColor?: string;
  fogColor?: string;
  glassBlur?: string;
  soundAmbiance?: string;
}

export interface TenantAccount {
  tenantId: string;
  username: string;
  email: string;
  masterPasswordHash: string;
  tier: 'starter' | 'pro' | 'enterprise';
  quotaBytes: number;
  createdAt: string;
}

export interface PhotoBranch {
  id: string;
  nodeId: string;
  filename: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  encryptedHash: string;
  aesKeyId: string;
  isEncrypted: boolean;
  aiTags: string[];
  aiCaption: string;
  ocrText?: string;
  exif?: {
    camera?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    dateTaken?: string;
    dimensions?: string;
  };
  pHash?: string;
}

export interface MemoryNode {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  notes: string;
  checklists: { id: string; text: string; completed: boolean }[];
  tags: string[];
  color: string;
  iconName: string;
  geometryShape: 'sphere' | 'octahedron' | 'torus' | 'crystal' | 'icosahedron';
  coverPhotoUrl?: string;
  branches: PhotoBranch[];
  position: [number, number, number];
  velocity?: [number, number, number];
  connectedTo: string[];
  pinned: boolean;
  versionHistory: { timestamp: string; note: string; author: string }[];
  lastModified: string;
}

export interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  zkEncryptionEnabled: boolean;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  createdAt: string;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | '2FA_VERIFIED' | 'E2EE_KEY_DERIVED' | 'PHOTO_UPLOAD' | 'SESSION_REVOKED' | 'DISASTER_RECOVERY_EXPORT';
  ipAddress: string;
  device: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface EntranceState {
  stage: 'auth' | 'decryption' | 'warp' | 'dashboard';
  progress: number;
  decryptionLog: string[];
}
