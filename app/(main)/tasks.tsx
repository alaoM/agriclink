// app/(main)/tasks.tsx
// Task manager – with Bearer‑token auth via useAuth()

import { AppText } from '@/components/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

/* ------------------------------------------------------------------
   Types & helpers
-------------------------------------------------------------------*/
interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;


const fetchTasks = async (token: string | null): Promise<Task[]> => { 
  const res = await fetch(`${API_BASE}/api/tasks/getTasks`, {
     headers: { Authorization: `Bearer ${token}` },
     
  }); 
  if (!res.ok) throw new Error('Failed to load tasks');
  const json = await res.json();
return json.task; 
};

const createTask = async (
  token: string | null,
  payload: Omit<Task, '_id' | 'status'>,
) => {
  const res = await fetch(`${API_BASE}/api/tasks/createTasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
       Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...payload, status: 'pending' }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};

const updateTask = async (
  token: string | null,
  id: string,
  payload: Partial<Task>,
) => {
  const res = await fetch(`${API_BASE}/api/tasks/updateTasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

const deleteTask = async (token: string | null, id: string) => {
  const res = await fetch(`${API_BASE}/api/tasks/deleteTasks/${id}`, {
    method: 'DELETE',
    headers: {Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return true;
};

/* ------------------------------------------------------------------
   Component
-------------------------------------------------------------------*/
export default function TaskScreen() {
  const { token } = useAuth();
  const { top } = useSafeAreaInsets();
  const queryClient = useQueryClient();

  /* ---------------------- React Query hooks --------------------- */
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', token],
    queryFn: () => fetchTasks(token),
    enabled: !!token,
  });

 

  const addMut = useMutation({
    mutationFn: (payload: Omit<Task, '_id' | 'status'>) => createTask(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      Toast.show({ type: 'success', text1: 'Task added' });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) => updateTask(token, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const getDueStatus = (dueDate: string, status: Task['status']) => {
  const due = parseISO(dueDate);
  const today = new Date();

  const diff = differenceInCalendarDays(due, today);
  if (status === 'completed') return `Completed by ${format(due, 'MMM d')}`;
  if (diff > 0) return `Due in ${diff} day${diff > 1 ? 's' : ''}`;
  if (diff === 0) return 'Due today';
  return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`;
};

  /* ------------------------ local state ------------------------- */
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [showDatePicker,setShowDatePicker] = useState(false);

  const resetForm = () => setForm({ title: '', description: '', dueDate: '' });
  const openSheetForNew = () => {
    resetForm();
    setEditing(null);
    setSheetVisible(true);
  };
  const openSheetForEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, dueDate: t.dueDate.slice(0, 10) });
    setSheetVisible(true);
  };
  const closeSheet = () => setSheetVisible(false);

  const saveTask = () => {
    if (!form.title.trim()) return Toast.show({ type: 'error', text1: 'Title is required' });
    if (editing) {
      updateMut.mutate({ id: editing._id, payload: { ...form } });
    } else {
      addMut.mutate(form);
    }
    closeSheet();
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Pressable
      style={[styles.card, item.status === 'completed' && styles.cardDone]}
      onPress={() => openSheetForEdit(item)}
    >
      <View style={styles.cardLeft}>
        <Feather
          name={item.status === 'completed' ? 'check-circle' : 'circle'}
          size={22}
          color={item.status === 'completed' ? '#27ae60' : '#95a5a6'}
          onPress={() => updateMut.mutate({ id: item._id, payload: { status: item.status === 'completed' ? 'pending' : 'completed' } })}
        />
        <View style={styles.cardTextBox}>
  <AppText style={styles.cardTitle}>{item.title}</AppText>
  <AppText style={styles.cardDesc}>{item.description}</AppText>
  <AppText style={styles.cardDue}>{getDueStatus(item.dueDate, item.status)}</AppText>
</View>
      </View>
      <MaterialIcons name="delete" size={22} color="#e74c3c" onPress={() => deleteMut.mutate(item._id)} />
    </Pressable>
  );

  return (
    <View style={[styles.screen, { paddingTop: top + 8 }]}>
      <StatusBar barStyle="dark-content" />
      <AppText style={styles.heading}>Your Tasks</AppText>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
      />
      {/* FAB */}
      <Pressable style={styles.fab} onPress={openSheetForNew}>
        <Feather name="plus" size={28} color="#fff" />
      </Pressable>
      {/* Bottom sheet */}
      <Modal
        isVisible={sheetVisible}
        onBackdropPress={closeSheet}
        style={styles.modal}
        swipeDirection="down"
        onSwipeComplete={closeSheet}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <AppText style={styles.sheetTitle}>{editing ? 'Edit Task' : 'New Task'}</AppText>
            <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
            <TextInput style={[styles.input, styles.multiline]} placeholder="Description" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
              

             <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
              <AppText>{form.dueDate || 'Select Due Date'}</AppText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={form.dueDate ? new Date(form.dueDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    const iso = selectedDate.toISOString().slice(0, 10);
                    setForm({ ...form, dueDate: iso });
                  }
                }}
              />
            )}
            
            <Pressable style={styles.saveBtn} onPress={saveTask}>
              <AppText style={styles.saveText}>{editing ? 'Update Task' : 'Create Task'}</AppText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const CARD_RAD = 12;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  heading: { fontSize: 24, fontWeight: '700', marginHorizontal: 20, marginBottom: 12, color: '#2c3e50' },
  listContent: { paddingHorizontal: 20, paddingBottom: 80 },
  /* card */
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: CARD_RAD, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardDone: { opacity: 0.5 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardTextBox: { marginLeft: 12, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  cardDesc: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  cardDue: { fontSize: 12, color: '#c0392b', marginTop: 2 },

  /* FAB */
  fab: { position: 'absolute', right: 24, bottom: 40, width: 56, height: 56, borderRadius: 28, backgroundColor: '#27ae60', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#27ae60', shadowOpacity: 0.3, shadowRadius: 4 },
  /* modal / sheet */
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', marginVertical: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginVertical: 12, color: '#34495e' },
  input: { backgroundColor: '#F1F3F4', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  multiline: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#27ae60', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
