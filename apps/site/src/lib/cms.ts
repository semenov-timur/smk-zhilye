export type CmsStatus = 'available' | 'unavailable'

/**
 * Проверяет, отвечает ли CMS. Никогда не бросает исключение: при сетевой
 * ошибке, таймауте или ответе не 2xx возвращает 'unavailable', чтобы
 * страница сайта продолжала работать без CMS.
 */
export async function getCmsStatus(baseUrl: string, timeoutMs = 2000): Promise<CmsStatus> {
  try {
    const response = await fetch(new URL('/api/users/me', baseUrl), {
      signal: AbortSignal.timeout(timeoutMs),
    })
    // Тело не нужно — освобождаем соединение
    await response.body?.cancel()
    return response.ok ? 'available' : 'unavailable'
  } catch {
    return 'unavailable'
  }
}
