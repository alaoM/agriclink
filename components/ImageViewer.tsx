import { Feather } from '@expo/vector-icons';
import { Dimensions, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
const { width, height } = Dimensions.get('window');

export default function ImageViewer({ uri, onClose }: Props) {
  if (!uri) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!uri}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* full‑screen backdrop : any press here closes */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* centred box that *stops* the press so the image itself isn’t a close target */}
        <View style={styles.frame}>
          <Image
            source={{ uri }}
            style={styles.img}
            resizeMode="contain"
          />
          <Pressable onPress={onClose} style={styles.close}>
            <Feather name="x" size={28} color="#FFF" />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* 90 % of the shorter side, leaving a border all around */
  frame: {
    maxWidth: width * 0.9,
    maxHeight: height * 0.9,
  },

  img: {
    width: '100%',
    height: '100%',
  },

  close: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0008',
    borderRadius: 20,
    padding: 8,
  },
});
