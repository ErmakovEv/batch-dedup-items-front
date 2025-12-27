/**
 * Вспомогательный тип для уменьшения числа на 1
 * Используется для отслеживания глубины рекурсии
 */
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Вспомогательный тип для получения предыдущего числа
 */
type PrevN<N extends number> = Prev[N];

/**
 * Проверка, является ли тип массивом
 */
type IsArray<T> = T extends readonly any[] ? true : false;

/**
 * Извлечение типа элемента массива с помощью infer
 * Если T - массив, извлекаем тип элемента U
 */
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Соединение двух путей в один строковый путь
 * Использует template literal types для конкатенации
 */
type JoinPath<Prefix extends string | number, Suffix extends string> = 
  Prefix extends string | number 
    ? Suffix extends string 
      ? `${Prefix}.${Suffix}`
      : never
    : never;

/**
 * Основной тип PropertyPath
 * Генерирует union строковых путей к свойствам типа T до глубины D
 * 
 * @template T - тип, для которого генерируются пути
 * @template D - максимальная глубина (1, 2, 3, ...)
 * 
 * Логика работы:
 * 1. Если глубина D = 1, возвращаем только ключи первого уровня
 * 2. Для каждого ключа K в T:
 *    - Если T[K] - массив: добавляем "K.*" и рекурсивно обрабатываем элемент массива
 *    - Если T[K] - объект (не примитив, не массив): добавляем "K" и рекурсивно обрабатываем вложенные свойства
 *    - Если T[K] - примитив: добавляем только "K"
 * 3. Используем indexed access type [keyof T] для получения union всех значений
 */
type PropertyPath<T, D extends number> = 
  // Базовый случай: глубина = 1, возвращаем только ключи первого уровня
  D extends 1
    ? keyof T extends string | number 
      ? `${keyof T}`
      : never
    : {
        // Мapped type: для каждого ключа K в T
        [K in keyof T]: 
          // Проверяем, является ли значение массивом
          IsArray<T[K]> extends true
            ? K extends string | number
              // Для массива: добавляем "K.*" и рекурсивно обрабатываем элемент
              ? `${K}.*` | JoinPath<K, PropertyPath<ArrayElement<T[K]>, PrevN<D>>>
              : never
            // Проверяем, является ли значение объектом (не примитивом)
            : T[K] extends object
              ? T[K] extends Function
                // Функции не обрабатываем как объекты
                ? K extends string | number
                  ? `${K}`
                  : never
                // Для объекта: добавляем "K" и рекурсивно обрабатываем вложенные свойства
                : K extends string | number
                  ? `${K}` | JoinPath<K, PropertyPath<T[K], PrevN<D>>>
                  : never
              // Для примитивов: только ключ
              : K extends string | number
                ? `${K}`
                : never;
      }[keyof T]; // Indexed access для получения union всех значений

// Пример использования
interface User {
  id: number;
  name: string;
  address: {
    street: string;
    city: {
      name: string;
      zipCode: number;
      country: {
        code: string;
        name: string;
      };
    };
  };
  orders: Array<{
    id: number;
    items: Array<{
      productId: number;
      quantity: number;
    }>;
  }>;
}

// Тестирование типов
type PathsDepth1 = PropertyPath<User, 1>;
// Ожидается: "id" | "name" | "address" | "orders"

type PathsDepth2 = PropertyPath<User, 2>;
// Ожидается: "id" | "name" | "address.street" | "address.city" | "orders.*"

type PathsDepth3 = PropertyPath<User, 3>;
// Ожидается: "id" | "name" | "address.street" | "address.city.name" | 
// "address.city.zipCode" | "address.city.country" | "orders.*.id" | "orders.*.items"

export type { PropertyPath, User, PathsDepth1, PathsDepth2, PathsDepth3 };



