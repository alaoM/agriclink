import { AppText } from "@/components/AppText";
import { useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Status bar height adjustment for Android
const STATUS_TOP =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 16;

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  category: "Planting" | "Harvesting" | "Maintenance" | "Other";
}

export default function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Plant Summer Crops",
      description: "Prepare soil and plant tomatoes, peppers, and cucumbers",
      completed: false,
      dueDate: "2024-03-15",
      category: "Planting",
    },
    {
      id: "2",
      title: "Irrigation System Check",
      description: "Inspect and repair any leaks in the irrigation system",
      completed: false,
      dueDate: "2024-03-10",
      category: "Maintenance",
    },
  ]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  const showModal = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedTask(null);
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    hideModal();
  };

  const editTask = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    hideModal();
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = () => {
    if (newTask.title.trim() === "") return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      dueDate: newTask.dueDate,
      category: "Other",
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", dueDate: "" });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.heading}>Farm Tasks</AppText>

        {/* Add New Task Section */}
        <View style={styles.addTaskCard}>
          <AppText style={styles.sectionTitle}>Add New Task</AppText>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            placeholderTextColor="#999"
            value={newTask.title}
            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Task Description"
            placeholderTextColor="#999"
            multiline
            value={newTask.description}
            onChangeText={(text) =>
              setNewTask({ ...newTask, description: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Due Date (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={newTask.dueDate}
            onChangeText={(text) => setNewTask({ ...newTask, dueDate: text })}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <AppText style={styles.addButtonText}>Add Task</AppText>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <AppText style={styles.sectionTitle}>
          Your Tasks ({tasks.length})
        </AppText>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, task.completed && styles.completedCard]}
            onPress={() => showModal(task)}
          >
            <View style={styles.taskHeader}>
              <AppText style={styles.title}>{task.title}</AppText>
              <View
                style={[
                  styles.categoryTag,
                  styles[
                    `${task.category.toLowerCase()}Tag` as keyof typeof styles
                  ],
                ]}
              >
                <AppText style={styles.categoryText}>{task.category}</AppText>
              </View>
            </View>
            <AppText style={styles.description}>{task.description}</AppText>
            <View style={styles.taskFooter}>
              <AppText style={styles.dueDate}>Due: {task.dueDate}</AppText>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    task.completed
                      ? styles.completedIndicator
                      : styles.pendingIndicator,
                  ]}
                />
                <AppText style={styles.statusText}>
                  {task.completed ? "Completed" : "Pending"}
                </AppText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task Actions Modal */}
      {/* Task Actions Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayBackground}
            activeOpacity={1}
            onPress={hideModal}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {selectedTask && (
                <>
                  <View style={styles.modalHeader}>
                    <AppText style={styles.modalTitle}>
                      {selectedTask.title}
                    </AppText>
                    <TouchableOpacity
                      onPress={hideModal}
                      style={styles.closeButton}
                    >
                      <AppText style={styles.closeButtonText}>×</AppText>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScrollContent}>
                    <View style={styles.modalDetails}>
                      {/* Modal content remains the same */}
                    </View>
                  </ScrollView>

                  <View style={styles.modalActions}>
                    {/* Action buttons remain the same */}
                  </View>
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CARD_RAD = 12;
const BACKDROP = "#f8f9fa";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKDROP,
    paddingTop: STATUS_TOP,
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#2c3e50",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 16,
    marginTop: 8,
  },
  addTaskCard: {
    backgroundColor: "#ffffff",
    borderRadius: CARD_RAD,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    fontSize: 16,
    color: "#2c3e50",
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: CARD_RAD,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    color: "#2c3e50",
  },
  description: {
    fontSize: 15,
    color: "#7f8c8d",
    marginBottom: 12,
    lineHeight: 22,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  plantingTag: {
    backgroundColor: "#e8f6f3",
  },
  harvestingTag: {
    backgroundColor: "#fef9e7",
  },
  maintenanceTag: {
    backgroundColor: "#eaf2f8",
  },
  otherTag: {
    backgroundColor: "#f5eef8",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  dueDate: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  pendingIndicator: {
    backgroundColor: "#f39c12",
  },
  completedIndicator: {
    backgroundColor: "#27ae60",
  },
  statusText: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    color: "#2c3e50",
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: "#7f8c8d",
    lineHeight: 28,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
  },
  modalActions: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: "#27ae60",
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  modalDetails: {
    paddingVertical: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalDescription: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 20,
    lineHeight: 24,
  },
  modalDate: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 20,
  },
});
