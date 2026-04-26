import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { apiEndSession } from '../../api/session';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import type { AppStackParamList } from '../../navigation/AppNavigator';

export type ChatMessage = {
  sessionId: string;
  text: string;
  userId: string;
  at: string;
};

type Props = NativeStackScreenProps<AppStackParamList, 'Room'>;

export function RoomScreen({ navigation, route }: Props) {
  const { sessionId, title, hostId } = route.params;
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [ending, setEnding] = useState(false);

  const isHost = user?.id === hostId;

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_room', { sessionId });

    const onReceive = (msg: ChatMessage) => {
      if (msg.sessionId !== sessionId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receive_message', onReceive);

    return () => {
      socket.off('receive_message', onReceive);
    };
  }, [socket, sessionId]);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || !socket) return;
    socket.emit('send_message', { sessionId, text });
    setDraft('');
  }, [draft, socket, sessionId]);

  const endSession = async () => {
    if (!isHost) return;
    setEnding(true);
    try {
      await apiEndSession(sessionId);
      Alert.alert('Session ended', '', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error)
          : 'Could not end session';
      Alert.alert('Error', msg || 'Could not end session');
    } finally {
      setEnding(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title || 'Discussion'}</Text>
        <Text style={styles.meta}>Room · {sessionId.slice(0, 8)}…</Text>
        {!socket ? <Text style={styles.connecting}>Connecting socket…</Text> : null}
      </View>

      <FlatList
        style={styles.listFlex}
        data={messages}
        keyExtractor={(item, i) => `${item.at}-${i}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet. Say hello.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.bubbleMeta}>
              {item.userId === user?.id ? 'You' : item.userId.slice(0, 8)}
            </Text>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message…"
          placeholderTextColor="#64748b"
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <PrimaryButton title="Send" onPress={sendMessage} style={styles.sendBtn} />
      </View>

      {isHost ? (
        <PrimaryButton
          title="End session (host)"
          onPress={endSession}
          loading={ending}
          style={styles.endBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f1a' },
  listFlex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  connecting: { fontSize: 12, color: '#fbbf24', marginTop: 6 },
  list: { padding: 16, paddingBottom: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  bubble: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  bubbleMeta: { fontSize: 11, color: '#a78bfa', marginBottom: 4 },
  bubbleText: { fontSize: 16, color: '#e2e8f0' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#1e293b' },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f1f5f9',
    maxHeight: 100,
  },
  sendBtn: { paddingVertical: 12, minWidth: 88 },
  endBtn: { marginHorizontal: 12, marginBottom: 16, backgroundColor: '#b45309' },
});
