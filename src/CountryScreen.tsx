import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CountrySheet } from './CountrySheet';
import { COUNTRIES, type Country } from './countries';

export const CountryScreen = ({
  title,
  withSheet,
}: {
  title: string;
  withSheet: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleSelect = useCallback((selected: Country) => {
    setCountry(selected);
    setIsOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.button} onPress={() => setIsOpen(true)}>
        <Text style={styles.buttonText}>
          {country.flag} {country.name} ({country.dialCode})
        </Text>
      </Pressable>
      {withSheet && (
        <CountrySheet
          isOpen={isOpen}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1013',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#23262B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
