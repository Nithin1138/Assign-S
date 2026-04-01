import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  RefreshCw,
  Upload
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { useAuth } from '../../features/auth/context/AuthContext';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentAvatar?: string;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentAvatar
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const predefinedAvatars = useMemo(() => {
    const styles = ['avataaars', 'bottts', 'pixel-art', 'notionists', 'lorelei', 'big-smile', 'fun-emoji', 'thumbs'];
    const seeds = ['Felix', 'Aneka', 'Coco', 'Luna', 'Jasper', 'Milo', 'Oliver', 'Leo', 'Bella', 'Charlie', 'Max', 'Sophie', 'Jack', 'Mia'];
    return styles.flatMap(style =>
      seeds.map(seed => `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`)
    ).sort(() => Math.random() - 0.5).slice(0, 15);
  }, []);

  const [displayAvatars, setDisplayAvatars] = useState(predefinedAvatars);

  const randomize = () => {
    const styles = ['avataaars', 'bottts', 'pixel-art', 'notionists', 'lorelei', 'big-smile', 'fun-emoji', 'thumbs'];
    const newAvatars = styles.map(style => {
      const randomSeed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${style}/svg?seed=${randomSeed}`;
    });
    setDisplayAvatars(newAvatars);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onSelect(url);
      toast.success('Avatar uploaded successfully');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-3xl bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden border border-stone-100"
          >
            <div className="p-10 md:p-16">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Identity</span>
                  <h2 className="text-5xl font-bold text-stone-900 tracking-tighter">Choose your look</h2>
                  <p className="text-stone-500 font-medium text-lg">Select a preset, randomize, or upload your own.</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-4 hover:bg-stone-100 rounded-[2rem] transition-all text-stone-400 hover:text-stone-900 active:scale-90"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 mb-12">
                {displayAvatars.map((url, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.1, y: -8, rotate: i % 2 === 0 ? 2 : -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onSelect(url);
                      onClose();
                    }}
                    className={clsx(
                      "aspect-square rounded-[2.5rem] border-2 transition-all overflow-hidden p-1.5 bg-stone-50 group relative",
                      currentAvatar === url ? "border-stone-900 shadow-2xl shadow-stone-900/10" : "border-transparent hover:border-stone-200"
                    )}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover rounded-[2rem] transition-transform group-hover:scale-110" />
                    {currentAvatar === url && (
                      <div className="absolute inset-0 bg-stone-900/10 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check size={16} className="text-stone-900" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ scale: 1.1, y: -8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={randomize}
                  className="aspect-square rounded-[2.5rem] border-2 border-dashed border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-900 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center group-hover:bg-white transition-colors group-hover:rotate-180 duration-500">
                    <RefreshCw size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Random</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, y: -8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-[2.5rem] border-2 border-dashed border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-900 group"
                >
                  {uploading ? (
                    <RefreshCw className="animate-spin" size={24} />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center group-hover:bg-white transition-colors">
                        <Upload size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                    </>
                  )}
                </motion.button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />

              <div className="flex justify-between items-center pt-8 border-t border-stone-100">
                <p className="text-stone-400 text-sm font-medium italic">Powered by DiceBear API</p>
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="px-10 py-5 bg-stone-100 text-stone-600 rounded-[2rem] font-bold hover:bg-stone-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AvatarModal;
