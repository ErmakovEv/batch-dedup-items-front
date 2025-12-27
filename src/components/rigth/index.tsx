import { useState, useEffect } from 'react';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useReorderItemsMutation } from '../../store/api/itemsApi';
import type { TItem } from '../../types';
import { useInfiniteScroll } from '../../common/useInfiniteScroll';

export default function RightWindow() {
  const [localItems, setLocalItems] = useState<TItem[] | null>(null);

  const { data, isLoading, isFetching, filter, setFilter, containerRef } =
    useInfiniteScroll({ selectedOnly: true });

  const [reorderItems] = useReorderItemsMutation();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (data?.items) {
      setLocalItems(data.items);
    }
  }, [data?.items]);

  useEffect(() => {
    if (data?.items) {
      const order = data.items.map((item) => item.id);
      localStorage.setItem('selectedOrder', JSON.stringify(order));
    }
  }, [data?.items]);

  useEffect(() => {
    const savedOrder = localStorage.getItem('selectedOrder');
    if (savedOrder && data?.items) {
      try {
        const order = JSON.parse(savedOrder);
        const currentOrder = data.items.map((item) => item.id);
        if (JSON.stringify(order) !== JSON.stringify(currentOrder)) {
          reorderItems({ order });
        }
      } catch (error) {
        console.error('Ошибка при восстановлении порядка:', error);
      }
    }
  }, [data?.items, reorderItems]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !localItems) {
      return;
    }

    const oldIndex = localItems.findIndex((item) => item.id === active.id);
    const newIndex = localItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(newOrder);

    const orderIds = newOrder.map((item) => item.id);

    try {
      await reorderItems({ order: orderIds }).unwrap();
      localStorage.setItem('selectedOrder', JSON.stringify(orderIds));
    } catch (error) {
      console.error('Ошибка при изменении порядка:', error);
      if (data?.items) {
        setLocalItems(data.items);
      }
    }
  };

  if (isLoading && data === undefined) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ width: '50%', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Выбранные элементы</h2>

      {/* Фильтр по ID */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Фильтр по ID"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Всего: {data?.total || 0} | Загружено: {data?.items.length || 0}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={containerRef}
          style={{
            height: '600px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            padding: '10px',
          }}
        >
          {localItems && localItems.length > 0 ? (
            <SortableContext
              items={localItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {localItems.map((item) => (
                <SortableItem key={item.id} item={item} />
              ))}
            </SortableContext>
          ) : (
            <div
              style={{ textAlign: 'center', padding: '20px', color: '#666' }}
            >
              Нет выбранных элементов
            </div>
          )}

          {isFetching && <div>Загрузка...</div>}

          {data && data.items.length >= data.total && data.items.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '10px',
                color: '#666',
              }}
            >
              Все элементы загружены
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}

function SortableItem({ item }: { item: TItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    borderBottom: '1px solid #eee',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      ID: {item.id}
    </div>
  );
}
