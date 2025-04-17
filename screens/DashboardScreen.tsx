"use client"

import React, { useRef, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { FadeIn, FadeOut, SlideInRight, Layout } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import {
  Search,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  AlertCircle,
  Tag,
  Trash2,
  Sliders,
  Link,
  CheckCircle2,
} from "lucide-react-native"
import { Swipeable } from "react-native-gesture-handler"
import type { NavigationProp, Notification } from "../type"

const { width } = Dimensions.get("window")

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const categories = [
  { id: "all", name: "All", icon: Bell },
  { id: "important", name: "Important", icon: AlertCircle },
  { id: "work", name: "Work", icon: Calendar },
  { id: "social", name: "Social", icon: MessageSquare },
  { id: "promo", name: "Promotions", icon: Tag },
]

const mockNotifications: Notification[] = [
  {
    id: "1",
    app: "Gmail",
    sender: "John Doe",
    title: "Project Update",
    message: "Hey, I've finished the design mockups for the new feature.",
    time: "10:30 AM",
    category: "work",
    isRead: false,
    icon: Mail,
  },
  {
    id: "2",
    app: "WhatsApp",
    sender: "Sarah",
    title: "Weekend Plans",
    message: "Are we still meeting up this Saturday for lunch?",
    time: "9:15 AM",
    category: "social",
    isRead: false,
    icon: MessageSquare,
  },
  {
    id: "3",
    app: "Calendar",
    sender: "Team Meeting",
    title: "Weekly Standup",
    message: "Your meeting starts in 30 minutes.",
    time: "Yesterday",
    category: "work",
    isRead: true,
    icon: Calendar,
  },
  {
    id: "4",
    app: "Gmail",
    sender: "Amazon",
    title: "Your Order Has Shipped",
    message: "Your recent order #12345 has shipped and will arrive tomorrow.",
    time: "Yesterday",
    category: "promo",
    isRead: true,
    icon: Mail,
  },
  {
    id: "5",
    app: "Slack",
    sender: "Design Team",
    title: "New Comment",
    message: 'Alex commented on your design: "This looks great!"',
    time: "2 days ago",
    category: "work",
    isRead: true,
    icon: MessageSquare,
  },
]

const DashboardScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [notifications, setNotifications] = React.useState(mockNotifications)
  const [searchQuery, setSearchQuery] = React.useState("")

  const swipeableRefs = useRef<Array<Swipeable | null>>([])

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query) ||
          item.sender.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [notifications, selectedCategory, searchQuery])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const renderSwipeActions = useCallback(
    (id: string) => {
      const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
      const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
      const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
      const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")
      return (
        <View style={styles.swipeActions}>
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: "#10b981" }]}
            onPress={() => {
              markAsRead(id)
              const index = Number.parseInt(id) - 1
              if (index >= 0 && index < swipeableRefs.current.length) {
                swipeableRefs.current[index]?.close()
              }
            }}
          >
            <CheckCircle2 color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: "#ef4444" }]}
            onPress={() => deleteNotification(id)}
          >
            <Trash2 color="white" size={24} />
          </TouchableOpacity>
        </View>
      )
    },
    [markAsRead, deleteNotification, isDark],
  )

  const renderNotificationItem = useCallback(
    ({ item, index }: { item: Notification; index: number }) => {
      const Icon = item.icon
      const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
      const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
      const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
      const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")
      return (
        <Animated.View entering={FadeIn.delay(index * 100)} exiting={FadeOut} layout={Layout.springify()}>
          <Swipeable
            ref={(ref) => (swipeableRefs.current[index] = ref)}
            renderRightActions={() => renderSwipeActions(item.id)}
            overshootRight={false}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate("NotificationDetail", { notification: item })
              }}
            >
              <View
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: getCardBgColor(),
                    borderColor: getCardBorderColor(),
                    opacity: item.isRead ? 0.8 : 1,
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                  <Icon size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.appName, { color: isDark ? "#6366f1" : "#4f46e5" }]}>{item.app}</Text>
                    <Text style={[styles.time, { color: getSecondaryTextColor() }]}>{item.time}</Text>
                  </View>

                  <Text style={[styles.sender, { color: getTextColor() }, item.isRead ? {} : { fontWeight: "700" }]}>
                    {item.sender}
                  </Text>

                  <Text style={[styles.message, { color: getSecondaryTextColor() }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>

                {!item.isRead && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          </Swipeable>
        </Animated.View>
      )
    },
    [isDark, navigation, renderSwipeActions],
  )

  const renderCategoryItem = useCallback(
    ({ item }: { item: (typeof categories)[0] }) => {
      const isSelected = selectedCategory === item.id
      const Icon = item.icon

      return (
        <AnimatedTouchable
          style={[
            styles.categoryItem,
            {
              backgroundColor: isSelected ? (isDark ? "#6366f1" : "#4f46e5") : isDark ? "#2e2e3e" : "#f8fafc",
            },
          ]}
          onPress={() => setSelectedCategory(item.id)}
          entering={SlideInRight}
        >
          <Icon size={16} color={isSelected ? "white" : isDark ? "#a1a1aa" : "#64748b"} />
          <Text
            style={[
              styles.categoryText,
              {
                color: isSelected ? "white" : isDark ? "#a1a1aa" : "#64748b",
              },
            ]}
          >
            {item.name}
          </Text>
        </AnimatedTouchable>
      )
    },
    [selectedCategory, isDark],
  )

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: getTextColor() }]}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("AISettings")}>
            <Sliders size={20} color={getTextColor()} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("Integration")}>
            <Link size={20} color={getTextColor()} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Settings")}>
            <View style={[styles.profileAvatar, { backgroundColor: isDark ? "#2e2e3e" : "#e2e8f0" }]}>
              <Text style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>JD</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={isDark ? "#6b7280" : "#94a3b8"} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: getTextColor(),
              backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
              borderColor: isDark ? "#2e2e3e" : "#e2e8f0",
            },
          ]}
          placeholder="Search notifications..."
          placeholderTextColor={isDark ? "#6b7280" : "#94a3b8"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={60} color={isDark ? "#2e2e3e" : "#e2e8f0"} />
            <Text style={[styles.emptyText, { color: getSecondaryTextColor() }]}>No notifications found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 32,
    top: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 48,
    fontSize: 16,
    borderWidth: 1,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  appName: {
    fontSize: 12,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  sender: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
    marginLeft: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    marginLeft: 10,
  },
  swipeAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    borderRadius: 16,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
})

export default DashboardScreen
