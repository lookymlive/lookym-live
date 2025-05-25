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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  leading: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: "#18181B",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  trailing: {
    marginLeft: 12,
  },
  unread: {
    backgroundColor: "#E0E7FF",
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
