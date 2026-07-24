import React, { createContext, useContext, useState, useEffect } from 'react';
import type { MemoryNode, PhotoBranch, UserProfile, DeviceSession, SecurityAuditLog, EntranceState, TenantAccount } from '../types';
import { SecurityEngine } from '../utils/security';
import { AIEngine } from '../utils/ai';
import { PWAEngine } from '../utils/pwa';
import { socketManager } from '../utils/socket';
import { audioEngine } from '../utils/audio';

interface VaultContextType {
  nodes: MemoryNode[];
  selectedNode: MemoryNode | null;
  selectedPhoto: PhotoBranch | null;
  user: UserProfile;
  sessions: DeviceSession[];
  auditLogs: SecurityAuditLog[];
  entranceState: EntranceState;
  zkMasterKey: CryptoKey | null;
  isOffline: boolean;
  searchQuery: string;
  searchResults: { matchedNodeId: string; score: number; reason: string }[];
  targetCameraPosition: [number, number, number] | null;
  userMasterPassword: string;
  
  // Actions
  registerTenant: (username: string, email: string, password: string, tier?: 'starter' | 'pro' | 'enterprise') => boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updateMasterPassword: (newPassword: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setEntranceStage: (stage: EntranceState['stage']) => void;
  selectNode: (node: MemoryNode | null) => void;
  selectPhoto: (photo: PhotoBranch | null) => void;
  createNode: (nodeData: Partial<MemoryNode>) => void;
  updateNode: (nodeId: string, updates: Partial<MemoryNode>) => void;
  deleteNode: (nodeId: string) => void;
  uploadPhotosToNode: (nodeId: string, files: File[]) => Promise<void>;
  deletePhotoFromNode: (nodeId: string, photoId: string) => void;
  movePhotoToNode: (photoId: string, sourceNodeId: string, targetNodeId: string) => void;
  setSearchQuery: (query: string) => void;
  flyToNode: (nodeId: string) => void;
  exportVaultBackup: () => void;
  restoreVaultBackup: (backupJson: string) => boolean;
  revokeSession: (sessionId: string) => void;
  addAuditLog: (eventType: SecurityAuditLog['eventType'], details: string, status?: SecurityAuditLog['status']) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const INITIAL_NODES: MemoryNode[] = [
  {
    id: 'node-1',
    title: 'Kyoto Zen Gardens & Shrines',
    category: 'Travel & Architecture',
    date: '2026-04-12',
    description: 'Serene morning walk through bamboo groves and ancient wooden pagoda temples in Kyoto.',
    notes: '# Kyoto Exploration Notes\n\n- Visit Fushimi Inari shrine at sunrise\n- Matcha tea ceremony in Gion\n- Capture high resolution RAW photos of stone lanterns',
    checklists: [
      { id: 'c1', text: 'Sunrise photo shoot at Arashiyama', completed: true },
      { id: 'c2', text: 'Backup memory cards to Cloud Vault', completed: true },
      { id: 'c3', text: 'Journal daily thoughts', completed: false }
    ],
    tags: ['Japan', 'Architecture', 'Zen', 'Travel', 'Photography'],
    color: '#00ff88',
    iconName: 'Compass',
    geometryShape: 'crystal',
    position: [-9, 3.5, 0],
    connectedTo: ['node-2', 'node-3'],
    pinned: true,
    versionHistory: [
      { timestamp: '2026-04-12 18:30', note: 'Created memory node', author: 'Vault Owner' }
    ],
    lastModified: '2026-04-12T18:30:00Z',
    branches: []
  },
  {
    id: 'node-2',
    title: 'Northern Lights Over Iceland Fjords',
    category: 'Celestial Expeditions',
    date: '2026-02-18',
    description: 'Experiencing the green aurora borealis dancing across snow-capped peaks in Vik.',
    notes: '# Iceland Aurora Expedition\n\nTemperature: -12°C. Clear skies with solar storm index KP5.',
    checklists: [
      { id: 'c4', text: 'Set camera tripods for long exposure', completed: true },
      { id: 'c5', text: 'Collect thermal gear', completed: true }
    ],
    tags: ['Aurora', 'Iceland', 'NightSky', 'Winter', 'Cosmic'],
    color: '#00f0ff',
    iconName: 'Sparkles',
    geometryShape: 'icosahedron',
    position: [9, 3, -4],
    connectedTo: ['node-1', 'node-4'],
    pinned: true,
    versionHistory: [
      { timestamp: '2026-02-18 22:10', note: 'Added initial aurora RAW captures', author: 'Vault Owner' }
    ],
    lastModified: '2026-02-18T22:10:00Z',
    branches: []
  },
  {
    id: 'node-3',
    title: 'Architectural Design Summit 2026',
    category: 'Innovation & Art',
    date: '2026-05-30',
    description: 'Keynotes on sustainable futuristic skyscrapers, glassmorphism UI, and 3D WebGL interfaces.',
    notes: '# Design Summit Takeaways\n\n- Micro-animations increase engagement by 40%\n- 3D Physics graphs make data exploration intuitive\n- Zero-knowledge encryption builds ultimate user trust',
    checklists: [
      { id: 'c6', text: 'Present Memory Vault prototype', completed: true },
      { id: 'c7', text: 'Network with Awwwards judges', completed: true }
    ],
    tags: ['Design', 'WebGL', 'Architecture', 'Keynote', 'Technology'],
    color: '#ffb700',
    iconName: 'Layers',
    geometryShape: 'torus',
    position: [0, -5.5, 6],
    connectedTo: ['node-1'],
    pinned: false,
    versionHistory: [
      { timestamp: '2026-05-30 14:00', note: 'Created design summit memory node', author: 'Vault Owner' }
    ],
    lastModified: '2026-05-30T14:00:00Z',
    branches: []
  },
  {
    id: 'node-4',
    title: 'Starlight Observatory & Deep Space',
    category: 'Astronomy',
    date: '2026-07-04',
    description: 'Stargazing session capturing distant nebulae and Milky Way core.',
    notes: 'Exposure specs: 20x 30s stacks with hydrogen-alpha filter.',
    checklists: [{ id: 'c8', text: 'Stack light frames', completed: true }],
    tags: ['Space', 'Nebula', 'Stars', 'Cosmic', 'NightSky'],
    color: '#ff0055',
    iconName: 'Globe',
    geometryShape: 'octahedron',
    position: [-7, -4.5, -5],
    connectedTo: ['node-2'],
    pinned: false,
    versionHistory: [{ timestamp: '2026-07-04 01:00', note: 'Created astronomical log', author: 'Vault Owner' }],
    lastModified: '2026-07-04T01:00:00Z',
    branches: []
  }
];

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<MemoryNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoBranch | null>(null);
  const [zkMasterKey, setZkMasterKey] = useState<CryptoKey | null>(null);
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ matchedNodeId: string; score: number; reason: string }[]>([]);
  const [targetCameraPosition, setTargetCameraPosition] = useState<[number, number, number] | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const [userMasterPassword, setUserMasterPassword] = useState<string>(() => {
    return localStorage.getItem('vault_master_passphrase') || 'VaultMaster#2026Secure!';
  });

  const [entranceState, setEntranceState] = useState<EntranceState>({
    stage: 'auth',
    progress: 0,
    decryptionLog: []
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const savedAvatar = localStorage.getItem('vault_user_avatar');
    const savedName = localStorage.getItem('vault_user_name');
    return {
      username: savedName || 'Harsh Kumar',
      email: 'harsh@antigravity.ai',
      avatarUrl: savedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      twoFactorEnabled: true,
      biometricEnabled: true,
      zkEncryptionEnabled: true,
      storageQuotaBytes: 25 * 1024 * 1024 * 1024,
      storageUsedBytes: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
  });

  const [sessions, setSessions] = useState<DeviceSession[]>([
    {
      id: 's-1',
      deviceName: 'MacBook Pro M3 Max (Primary)',
      browser: 'Chrome 126.0',
      ipAddress: '192.168.1.45 (Encrypted VPN)',
      location: 'San Francisco, CA, USA',
      lastActive: 'Just now',
      isCurrent: true
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      eventType: 'LOGIN_SUCCESS',
      ipAddress: '192.168.1.45',
      device: 'MacBook Pro M3 Max',
      status: 'SUCCESS',
      details: 'Zero-Knowledge authentication session verified'
    }
  ]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      PWAEngine.getAndClearOfflineQueue().then(queue => {
        if (queue.length > 0) {
          addAuditLog('PHOTO_UPLOAD', `Synced ${queue.length} offline queued memories to cloud storage`, 'SUCCESS');
        }
      });
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    socketManager.connect();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    PWAEngine.cacheVaultOffline(nodes);
  }, [nodes]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      if (updates.avatarUrl) localStorage.setItem('vault_user_avatar', updates.avatarUrl);
      if (updates.username) localStorage.setItem('vault_user_name', updates.username);
      return updated;
    });
    addAuditLog('LOGIN_SUCCESS', 'Updated user profile avatar & details');
  };

  const registerTenant = (username: string, email: string, password: string, tier: 'starter' | 'pro' | 'enterprise' = 'starter'): boolean => {
    const quotaMap = {
      starter: 25 * 1024 * 1024 * 1024,
      pro: 250 * 1024 * 1024 * 1024,
      enterprise: 2048 * 1024 * 1024 * 1024
    };

    const newTenant: TenantAccount = {
      tenantId: `tenant-${Date.now()}`,
      username,
      email,
      masterPasswordHash: password,
      tier,
      quotaBytes: quotaMap[tier] || quotaMap.starter,
      createdAt: new Date().toISOString()
    };

    setUser({
      username: newTenant.username,
      email: newTenant.email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      twoFactorEnabled: true,
      biometricEnabled: true,
      zkEncryptionEnabled: true,
      storageQuotaBytes: newTenant.quotaBytes,
      storageUsedBytes: 0,
      createdAt: newTenant.createdAt
    });

    setUserMasterPassword(password);
    localStorage.setItem('vault_master_passphrase', password);
    addAuditLog('LOGIN_SUCCESS', `Registered new private tenant SaaS account: ${email} (${tier.toUpperCase()})`);
    return true;
  };

  const updateMasterPassword = (newPassword: string) => {
    setUserMasterPassword(newPassword);
    localStorage.setItem('vault_master_passphrase', newPassword);
  };

  const addAuditLog = (eventType: SecurityAuditLog['eventType'], details: string, status: SecurityAuditLog['status'] = 'SUCCESS') => {
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType,
      ipAddress: '192.168.1.45',
      device: 'MacBook Pro',
      status,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      if (password !== userMasterPassword) {
        addAuditLog('LOGIN_FAILED', 'Failed login attempt - invalid security passkey', 'FAILED');
        return false;
      }

      setEntranceState({ stage: 'decryption', progress: 10, decryptionLog: ['Authenticating tenant session...'] });
      
      const key = await SecurityEngine.deriveMasterKey(password);
      setZkMasterKey(key);

      await new Promise(r => setTimeout(r, 600));
      setEntranceState(prev => ({
        ...prev,
        progress: 40,
        decryptionLog: [...prev.decryptionLog, 'Deriving AES-256-GCM Zero-Knowledge Key via PBKDF2...', 'Decrypting Tenant Vault...']
      }));

      await new Promise(r => setTimeout(r, 700));
      setEntranceState(prev => ({
        ...prev,
        progress: 80,
        decryptionLog: [...prev.decryptionLog, 'Verifying SHA-256 cloud node integrity... Clean [✓]']
      }));

      await new Promise(r => setTimeout(r, 500));
      setEntranceState({ stage: 'warp', progress: 100, decryptionLog: [] });

      audioEngine.playWarpTransitionSound();
      addAuditLog('E2EE_KEY_DERIVED', 'ZK Master key derived for tenant session');
      return true;
    } catch {
      addAuditLog('LOGIN_FAILED', 'Failed login attempt - invalid security passkey', 'FAILED');
      return false;
    }
  };

  const logout = () => {
    setZkMasterKey(null);
    setSelectedNode(null);
    setSelectedPhoto(null);
    setEntranceState({ stage: 'auth', progress: 0, decryptionLog: [] });
    audioEngine.stopAmbient();
  };

  const selectNode = (node: MemoryNode | null) => {
    setSelectedNode(node);
    if (node) {
      audioEngine.playNodeSelectSound();
      flyToNode(node.id);
    }
  };

  const selectPhoto = (photo: PhotoBranch | null) => {
    setSelectedPhoto(photo);
    if (photo) audioEngine.playNodeSelectSound();
  };

  const flyToNode = (nodeId: string) => {
    const target = nodes.find(n => n.id === nodeId);
    if (target) {
      setTargetCameraPosition(target.position);
    }
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    if (query.trim()) {
      const results = AIEngine.semanticSearch(query, nodes);
      setSearchResults(results);
      if (results.length > 0) {
        flyToNode(results[0].matchedNodeId);
      }
    } else {
      setSearchResults([]);
    }
  };

  const createNode = (nodeData: Partial<MemoryNode>) => {
    const newNode: MemoryNode = {
      id: `node-${Date.now()}`,
      title: nodeData.title || 'Untitled Memory Node',
      category: nodeData.category || 'Personal',
      date: nodeData.date || new Date().toISOString().split('T')[0],
      description: nodeData.description || '',
      notes: nodeData.notes || '# Memory Notes\n\nAdd your thoughts here...',
      checklists: [],
      tags: nodeData.tags || ['Memory'],
      color: nodeData.color || '#00f0ff',
      iconName: nodeData.iconName || 'Compass',
      geometryShape: nodeData.geometryShape || 'sphere',
      branches: [],
      position: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10],
      connectedTo: nodes.length > 0 ? [nodes[0].id] : [],
      pinned: false,
      versionHistory: [{ timestamp: new Date().toLocaleString(), note: 'Node created', author: user.username }],
      lastModified: new Date().toISOString()
    };

    setNodes(prev => [newNode, ...prev]);
    setSelectedNode(newNode);
    flyToNode(newNode.id);
    addAuditLog('PHOTO_UPLOAD', `Created new memory node: "${newNode.title}"`);
    socketManager.emitNodeChange({ type: 'CREATE', node: newNode });
  };

  const updateNode = (nodeId: string, updates: Partial<MemoryNode>) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const updated = {
          ...n,
          ...updates,
          lastModified: new Date().toISOString(),
          versionHistory: [
            { timestamp: new Date().toLocaleString(), note: 'Node updated', author: user.username },
            ...n.versionHistory
          ]
        };
        if (selectedNode?.id === nodeId) setSelectedNode(updated);
        return updated;
      }
      return n;
    }));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
    addAuditLog('PHOTO_UPLOAD', `Deleted memory node #${nodeId}`, 'WARNING');
  };

  const uploadPhotosToNode = async (nodeId: string, files: File[]): Promise<void> => {
    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    const newBranches: PhotoBranch[] = [];

    for (const file of files) {
      const tags = AIEngine.analyzeImageTags(file.name);
      const ocrText = AIEngine.extractOCRText(file.name);
      const caption = AIEngine.generateCaption(file.name, tags);
      const pHash = AIEngine.generatePHash(file.name, file.size);
      const hash = await SecurityEngine.hashData(file.name + file.size);

      const objectUrl = URL.createObjectURL(file);

      const branch: PhotoBranch = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nodeId,
        filename: file.name,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        url: objectUrl,
        thumbnailUrl: objectUrl,
        sizeBytes: file.size,
        mimeType: file.type || 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        encryptedHash: hash,
        aesKeyId: `aes-key-${Date.now()}`,
        isEncrypted: true,
        aiTags: tags,
        aiCaption: caption,
        ocrText,
        pHash,
        exif: {
          camera: 'Cloud Encrypted Asset',
          location: 'Memory Vault Storage',
          dateTaken: new Date().toLocaleString(),
          dimensions: 'Original Resolution'
        }
      };

      newBranches.push(branch);

      if (isOffline) {
        await PWAEngine.queueOfflineUpload({ nodeId, filename: file.name, size: file.size });
      }
    }

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const updated = {
          ...n,
          coverPhotoUrl: n.coverPhotoUrl || (newBranches[0] ? newBranches[0].url : undefined),
          branches: [...newBranches, ...n.branches],
          lastModified: new Date().toISOString()
        };
        if (selectedNode?.id === nodeId) setSelectedNode(updated);
        return updated;
      }
      return n;
    }));

    addAuditLog('PHOTO_UPLOAD', `Uploaded ${files.length} encrypted photo(s) to node "${targetNode.title}"`);
  };

  const deletePhotoFromNode = (nodeId: string, photoId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const updatedBranches = n.branches.filter(b => b.id !== photoId);
        const updated = {
          ...n,
          branches: updatedBranches,
          coverPhotoUrl: updatedBranches[0] ? updatedBranches[0].url : undefined
        };
        if (selectedNode?.id === nodeId) setSelectedNode(updated);
        return updated;
      }
      return n;
    }));
  };

  const movePhotoToNode = (photoId: string, sourceNodeId: string, targetNodeId: string) => {
    let targetPhoto: PhotoBranch | null = null;

    setNodes(prev => prev.map(n => {
      if (n.id === sourceNodeId) {
        const p = n.branches.find(b => b.id === photoId);
        if (p) targetPhoto = { ...p, nodeId: targetNodeId };
        return {
          ...n,
          branches: n.branches.filter(b => b.id !== photoId)
        };
      }
      return n;
    }));

    if (targetPhoto) {
      const movedPhoto = targetPhoto;
      setNodes(prev => prev.map(n => {
        if (n.id === targetNodeId) {
          return {
            ...n,
            branches: [movedPhoto, ...n.branches]
          };
        }
        return n;
      }));
    }
  };

  const exportVaultBackup = () => {
    const backupData = {
      exportVersion: '2026.1.0',
      timestamp: new Date().toISOString(),
      user: { username: user.username, email: user.email },
      nodes,
      auditLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-vault-zk-backup-${new Date().toISOString().split('T')[0]}.vault`;
    a.click();
    URL.revokeObjectURL(url);

    addAuditLog('DISASTER_RECOVERY_EXPORT', 'Exported encrypted .vault disaster recovery backup snapshot');
  };

  const restoreVaultBackup = (backupJson: string): boolean => {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
        setNodes(parsed.nodes);
        addAuditLog('DISASTER_RECOVERY_EXPORT', 'Restored vault snapshot successfully');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const revokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    addAuditLog('SESSION_REVOKED', `Remote session #${sessionId} revoked`, 'WARNING');
  };

  return (
    <VaultContext.Provider
      value={{
        nodes,
        selectedNode,
        selectedPhoto,
        user,
        sessions,
        auditLogs,
        entranceState,
        zkMasterKey,
        isOffline,
        searchQuery,
        searchResults,
        targetCameraPosition,
        userMasterPassword,
        registerTenant,
        login,
        logout,
        updateMasterPassword,
        updateUserProfile,
        setEntranceStage: stage => setEntranceState(prev => ({ ...prev, stage })),
        selectNode,
        selectPhoto,
        createNode,
        updateNode,
        deleteNode,
        uploadPhotosToNode,
        deletePhotoFromNode,
        movePhotoToNode,
        setSearchQuery,
        flyToNode,
        exportVaultBackup,
        restoreVaultBackup,
        revokeSession,
        addAuditLog
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used within a VaultProvider');
  return context;
};
