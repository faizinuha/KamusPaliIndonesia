import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../styles/AppStyles';

const TabBar = ({ activeTab, onTabChange }) => {
    const handleSearchPress = useCallback(() => onTabChange('search'), [onTabChange]);
    const handleHistoryPress = useCallback(() => onTabChange('history'), [onTabChange]);
    const handleFavoritesPress = useCallback(() => onTabChange('favorites'), [onTabChange]);
    const handleSettingsPress = useCallback(() => onTabChange('settings'), [onTabChange]);
   
    return (
        <View style={styles.tabContainer}>
            <TabItem
                isActive={activeTab === 'search'}
                onPress={handleSearchPress}
                icon="search"
                label="Cari"
            />
            <TabItem
                isActive={activeTab === 'history'}
                onPress={handleHistoryPress}
                icon="compass"
                label="History"
            />

            <TabItem
                isActive={activeTab === 'favorites'}
                onPress={handleFavoritesPress}
                icon="star"
                label="Favorit"
            />
            <TabItem
                isActive={activeTab === 'settings'}
                onPress={handleSettingsPress}
                icon="users"
                label="Services"
            />
        </View>
    );
};

const TabItem = memo(({ isActive, onPress, icon, label }) => (
    <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={onPress}
    >
        <Icon
            name={icon}
            size={20}
            color={isActive ? theme.primary : theme.textLight}
        />
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {label}
        </Text>
    </TouchableOpacity>
));

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: theme.primaryLight,
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        color: theme.textLight,
        fontWeight: '500',
    },
    activeTabText: {
        color: theme.primary,
        fontWeight: '600',
    },
});

export default TabBar;