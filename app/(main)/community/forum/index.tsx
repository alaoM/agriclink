import { AppText } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type ForumTopic = { id: string; title: string };

const initialTopics: ForumTopic[] = [
  { id: '1', title: 'Best farming practices' },
  { id: '2', title: 'Pest control advice' },
  { id: '3', title: 'Organic fertilizers' },
];

export default function ForumScreen() {
  const [topics, setTopics] = useState(initialTopics);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const router = useRouter();

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    const topic = { id: Date.now().toString(), title: newTopic.trim() };
    setTopics(prev => [...prev, topic]);
    setNewTopic('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.topicCard}
            onPress={() => router.push(`/forum/${item.id}`)}
          >
            <AppText style={styles.topicText}>{item.title}</AppText>
          </TouchableOpacity>
        )}
      />

      {/* Floating Button */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Modal for new topic */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Create New Topic</AppText>
            <TextInput
              placeholder="Enter topic title"
              value={newTopic}
              onChangeText={setNewTopic}
              style={styles.input}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                <AppText>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddTopic} style={[styles.modalBtn, styles.modalConfirm]}>
                <AppText style={{ color: '#FFF' }}>Create</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const GREEN = '#2E7D32';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 12 },

  topicCard: {
    backgroundColor: '#F1F1F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  topicText: { fontSize: 16, color: '#333' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: GREEN,
    borderRadius: 30,
    padding: 14,
    elevation: 3,
  },

  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 8,
    padding: 10, fontSize: 16, marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: { padding: 10 },
  modalConfirm: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
});
