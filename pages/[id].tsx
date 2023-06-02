import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormLabel,
  Input,
  Select,
  Text,
} from '@chakra-ui/react';
import { DocumentData, DocumentSnapshot, doc, getDoc, query } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { useContext, useEffect, useState } from 'react';
import { Todo } from '@/types/todo';
import { AuthContext, db, useAuth, useLogout } from '@/hooks/firebase';

export default function detail() {
  const [editTodo, setEditTodo] = useState<Todo>({ title: '', status: '' });
  const [todo, setTodo] = useState<Todo>({ title: '', status: '' });
  const [todos, setTodos] = useState<DocumentData[]>([]);

  const auth = useAuth();
  const currentUser = auth.currentUser;
  const user = useContext(AuthContext);

  const router = useRouter();
  const { id } = router.query;
  const { logout } = useLogout(router);

  // idを使いコレクションからtodoのドキュメントを持ってくる
  // 画面が遷移する場合はglobalstateで管理するか、firestoreから取ってくるしかない

  {
    /* 編集するTodoを取得する */
  }

  const targetTodo = async () => {
    if (!currentUser) return;
    const userDocumentRef = doc(db, 'users', currentUser.uid, 'todos', id);
    getDoc(userDocumentRef).then((documentSnapshot: DocumentSnapshot<DocumentData>) => {
      setEditTodo(documentSnapshot.data());
    });
  };

  const onSubmit = ({ title, status }: { title: string; status: string }) => {
    // createTodo(title, status);
    console.log(todos);
    setTodos(todos);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    { title, status }: { title: string; status: string },
  ) => {
    if (e.key === 'Enter') onSubmit({ title, status });
  };

  return (
    <>
      <Header />

      {/* Todoの編集フォーム */}
      <Box p='2'>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Input
            onChange={(e) => setTodo({ ...todo, title: e.target.value })}
            type='text'
            width='100%'
            id='name'
            placeholder={editTodo.title}
            onKeyDown={(e) => handleKeyDown(e, todo)}
          />
          <Select width='140px' onChange={(e) => setTodo({ ...todo, status: e.target.value })}>
            <option value='未完了'>未完了</option>
            <option value='着手'>着手</option>
            <option value='完了'>完了</option>
          </Select>
          <ButtonGroup gap='2'>
            <Button
              colorScheme='teal'
              onClick={() => {
                onSubmit(todo);
              }}
            >
              保存
            </Button>
          </ButtonGroup>
        </Flex>
      </Box>
      <Link href='/'>
        <Text fontSize='2xl'>リストへ戻る</Text>
      </Link>
    </>
  );
}
