import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { ModalBottomSheet } from '@swmansion/react-native-bottom-sheet';

import { COUNTRIES, type Country } from './countries';

const SHEET_HEIGHT_RATIO = 0.9;

type CountrySheetProps = {
  isOpen: boolean;
  onClose(): void;
  onSelect(country: Country): void;
};

// Always mounted, closed at index 0 — the same way an app keeps a picker
// sheet on a tab screen. No interaction is needed to reproduce the loop.
export const CountrySheet = ({
  isOpen,
  onClose,
  onSelect,
}: CountrySheetProps) => {
  const { height } = useWindowDimensions();
  const detents = [0, height * SHEET_HEIGHT_RATIO];

  const handleIndexChange = useCallback(
    (index: number) => {
      if (index === 0) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isOpen, onClose]);

  return (
    <ModalBottomSheet
      index={isOpen ? 1 : 0}
      detents={detents}
      onIndexChange={handleIndexChange}
      scrimColor="rgba(0, 0, 0, 0.5)"
      surface={<View style={[StyleSheet.absoluteFill, styles.surface]} />}
    >
      <View style={styles.grabber} />
      <CountryList onSelect={onSelect} />
    </ModalBottomSheet>
  );
};

const CountryList = ({ onSelect }: { onSelect(country: Country): void }) => {
  const [search, setSearch] = useState('');

  const countries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return COUNTRIES;
    }
    return COUNTRIES.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query) ||
        country.dialCode.includes(query),
    );
  }, [search]);

  const renderItem = useCallback<ListRenderItem<Country>>(
    ({ item }) => (
      <Pressable style={styles.row} onPress={() => onSelect(item)}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.dialCode}>{item.dialCode}</Text>
      </Pressable>
    ),
    [onSelect],
  );

  return (
    <FlashList
      data={countries}
      keyExtractor={item => item.code}
      renderItem={renderItem}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="#888"
          autoCorrect={false}
          style={styles.search}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  surface: {
    backgroundColor: '#15181C',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginVertical: 10,
    backgroundColor: '#58595B',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#23262B',
  },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  flag: {
    fontSize: 18,
    marginRight: 12,
  },
  name: {
    flex: 1,
    color: '#E6E6E6',
    fontSize: 15,
  },
  dialCode: {
    color: '#8A8A8A',
    fontSize: 15,
  },
});
