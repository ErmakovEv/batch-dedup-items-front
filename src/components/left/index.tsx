import { useState } from 'react';
import {
  useAddItemMutation,
  useSelectItemMutation,
} from '../../store/api/itemsApi';
import { useInfiniteScroll } from '../../common/useInfiniteScroll';

export default function LeftWindow() {
  const [newItemId, setNewItemId] = useState('');

  const {
    data,
    isLoading,
    isFetching,
    filter,
    setFilter,
    containerRef,
    resetPage,
  } = useInfiniteScroll({ selectedOnly: false });

  const [addItem, { isLoading: isAdding }] = useAddItemMutation();
  const [selectItem] = useSelectItemMutation();

  const handleAddItem = async () => {
    const id = parseInt(newItemId);
    if (!id || isNaN(id)) {
      alert('Введите корректный ID');
      return;
    }

    try {
      await addItem({ id }).unwrap();
      setNewItemId('');
      resetPage();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? String(error.data.message)
          : 'Ошибка при добавлении';
      alert(errorMessage);
    }
  };

  const handleSelectItem = async (id: number) => {
    try {
      await selectItem({ id }).unwrap();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? String(error.data.message)
          : 'Ошибка при добавлении';
      alert(errorMessage);
    }
  };

  if (isLoading && data === undefined) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ width: '50%', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Все элементы</h2>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Фильтр по ID"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <input
          type="number"
          placeholder="Новый ID"
          value={newItemId}
          onChange={(e) => setNewItemId(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        {/* Оставил disabled=false для проверки батчинга  */}
        <button onClick={handleAddItem} disabled={false}>
          {isAdding ? 'Добавление...' : 'Добавить'}
        </button>
      </div>

      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Всего: {data?.total || 0} | Загружено: {data?.items.length || 0}
      </div>

      <div
        ref={containerRef}
        style={{
          height: '600px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '10px',
        }}
      >
        {data?.items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>ID: {item.id}</span>
            <button onClick={() => handleSelectItem(item.id)}>Выбрать</button>
          </div>
        ))}

        {isFetching && <div>Загрузка следующей страницы...</div>}

        {data && data.items.length >= data.total && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
            Все элементы загружены
          </div>
        )}
      </div>
    </div>
  );
}
