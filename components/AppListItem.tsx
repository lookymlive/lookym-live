import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface AppListItemProps {
  leadingElement?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  trailingElement?: React.ReactNode;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  highlightUnread?: boolean;
}

export const AppListItem: React.FC<AppListItemProps> = ({
  leadingElement,
  title,
  subtitle,
  trailingElement,
  onPress,
  containerStyle,
  titleStyle,
  subtitleStyle,
  highlightUnread,
}) => {
  const content = (
    <View
      style={[
        styles.container,
        containerStyle,
        highlightUnread && styles.unread,
      ]}
    >
      {leadingElement && <View style={styles.leading}>{leadingElement}</View>}
      <View style={styles.textContainer}>
        {typeof title === "string" ? (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
        {subtitle &&
          (typeof subtitle === "string" ? (
            <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          ))}
      </View>
      {trailingElement && (
        <View style={styles.trailing}>{trailingElement}</View>
      )}
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    // Gradiente visual: se puede reemplazar por LinearGradient si se usa expo-linear-gradient
    // background: 'linear-gradient(90deg, #6366F1 0%, #22D3EE 100%)',
  },
  leading: {
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 17,
    color: "#18181B",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  trailing: {
    marginLeft: 14,
  },
  unread: {
    backgroundColor: "#C7D2FE",
    borderWidth: 1,
    borderColor: "#6366F1",
  },
});

/**
 * Example usage:
 * <AppListItem
 *   leadingElement={<UserInfo ... />}
 *   title="Notificación de ejemplo"
 *   subtitle="Hace 2 horas"
 *   trailingElement={<Icon name="ChevronRight" />}
 *   onPress={() => {}}
 *   highlightUnread
 * />
 */
