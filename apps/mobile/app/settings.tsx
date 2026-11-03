import Constants from 'expo-constants';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';
import { runStorageDiagnostic } from '../src/storage/diagnostic';
import { colors } from '../src/theme';

export default function SettingsScreen() {
  const [checking, setChecking] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const demoRuntime = Platform.OS === 'web' || Constants.appOwnership === 'expo';

  const testEncryption = async () => {
    if (checking) return;
    if (demoRuntime) {
      setDiagnostic('Expo Go and web are previews. SQLCipher requires a separately installed native development build.');
      return;
    }

    setChecking(true);
    setDiagnostic(null);
    try {
      const result = await runStorageDiagnostic();
      setDiagnostic(result);
    } catch {
      // Never surface raw native SQLite errors: they might contain a key PRAGMA.
      setDiagnostic('Encryption check failed. No real financial storage is enabled. Rebuild with SQLCipher and inspect native diagnostics.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Screen title="About Artha" eyebrow="YOUR DATA, YOUR CONTROL" subtitle="A tracking-only personal finance app being developed in transparent milestones.">
      <Card title="Milestone 2a · Encryption test" note="Synthetic canary only. This test can verify SQLCipher in a native development build; it cannot certify backup or recovery.">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Run native encryption diagnostic"
          accessibilityState={{ disabled: checking }}
          disabled={checking}
          onPress={testEncryption}
          style={[styles.button, checking && styles.disabled]}
        >
          <Text style={styles.buttonText}>{checking ? 'Checking encryption…' : 'Run encryption diagnostic'}</Text>
        </Pressable>
        {diagnostic ? <Text accessibilityLiveRegion="polite" style={styles.status}>{diagnostic}</Text> : null}
      </Card>
      <Card title="Demo mode only" note="Expo Go and web cannot store real account information. Financial record entry is intentionally disabled." />
      <Card title="Privacy first" note="No bank access, cloud sync, credentials, real balances or financial records in this prototype. Secure backups and recovery are still being developed." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.accentDim, borderColor: colors.accent, borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  buttonText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  status: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
});
