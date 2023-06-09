import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  FormLabel,
  Input,
  Select,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  DocumentData,
  DocumentSnapshot,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { useContext, useEffect, useState } from 'react';
import { Todo } from '@/types/todo';
import { AuthContext, db, useAuth, useLogout } from '@/hooks/firebase';
import { CheckIcon } from '@chakra-ui/icons';

export default function Detail() {
  const [editTodo, setEditTodo] = useState<Todo>({ title: '', status: '' });
  const [todos, setTodos] = useState<DocumentData[]>([]);

  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  const router = useRouter();
  const { id } = router.query;

  // idを使いコレクションからtodoのドキュメントを持ってくる
  // 画面が遷移する場合はglobalstateで管理するか、firestoreから取ってくるしかない

  {
    /* ドキュメントを取得する */
    /* orderByで並べ替えも行う */
  }
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'users', currentUser.uid, 'todos'),
      orderBy('timestamp', 'desc'),
    );
    const unSub = onSnapshot(q, async (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          status: doc.data().status,
          timestamp: doc.data().timestamp,
        })),
      );
    });

    return () => {
      unSub();
    };
  }, [currentUser]);

  {
    /* 編集するTodoを取得する */
  }
  useEffect(() => {
    const targetTodo = async () => {
      if (!currentUser || !id) return;
      const userDocumentRef = doc(db, 'users', currentUser.uid, 'todos', id as string);
      const documentSnapshot = await getDoc(userDocumentRef);
      if (documentSnapshot.exists()) {
        setEditTodo(documentSnapshot.data() as Todo);
      }
    };
    targetTodo();
  }, [currentUser]);

  {
    /* 編集内容をfirestoreに保存*/
  }
  const updateTodo = async (title: string, status: string) => {
    if (!currentUser) return;
    if (title === '') return;
    await updateDoc(doc(db, 'users', currentUser.uid, 'todos', id as string), {
      title: title,
      status: status,
    });
    console.log(todos);
  };
  {
    /* フォームの内容をfirestoreに保存 */
  }
  const onSubmit = ({ title, status }: { title: string; status: string }) => {
    updateTodo(title, status);
    console.log(todos);
    setTodos(todos);
    router.push('/');
  };

  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    { title, status }: { title: string; status: string },
  ) => {
    if (e.key === 'Enter') {
      if (composing) return;
      onSubmit({ title, status });
    }
  };

  return (
    <>
      <Header />

      {/* Todoの編集フォーム */}
      <Box p='4' mb='20'>
        <Wrap minWidth='max-content' alignItems='center' gap='2'>
          <WrapItem width={{ base: '100%', md: '80%' }}>
            <Input
              onCompositionStart={startComposition}
              onCompositionEnd={endComposition}
              onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
              type='text'
              width='100%'
              id='name'
              value={editTodo.title}
              onKeyDown={(e) => handleKeyDown(e, editTodo)}
            />
          </WrapItem>
          <WrapItem>
            <Flex gap='2'>
              <Select
                width='140px'
                value={editTodo.status}
                onChange={(e) => setEditTodo({ ...editTodo, status: e.target.value })}
              >
                <option value='未完了'>未完了</option>
                <option value='着手'>着手</option>
                <option value='完了'>完了</option>
              </Select>
              <Button
                colorScheme='teal'
                onClick={() => {
                  onSubmit(editTodo);
                }}
              >
                <CheckIcon />
              </Button>
            </Flex>
          </WrapItem>
        </Wrap>
      </Box>
      <Center>
        <Link href='/'>
          <Text fontSize='2xl'>＜リストへ戻る</Text>
        </Link>
      </Center>
    </>
  );
}
