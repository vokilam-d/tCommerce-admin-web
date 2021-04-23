import { environment } from '../../../environments/environment';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { ShipmentStatusEnum } from '../enums/shipment-status.enum';
import { EProductsSort } from '../enums/product-sort.enum';
import { Language } from '../enums/language.enum';
import { ISelectOption } from '../components/select/select-option.interface';
import { Role } from '../enums/role.enum';

// export const API_HOST = environment.production ? '' : 'http://173.249.23.253:3080';
export const API_HOST = environment.production ? '' : 'http://localhost:3000';
export const UPLOADED_HOST = API_HOST;
// export const UPLOADED_HOST = 'http://173.249.23.253:3080';


export const SOCKET = {
  path: '/admin/ws',
  serverRestartTopic: 'server_restart'
};
export const DEFAULT_LANG: Language = Language.RU;
export const INPUT_MEDIA_ACCEPT_TYPES = '.jpg,.jpeg,.png,.webp,.svg,.tiff,.gif';
export const DEFAULT_ERROR_TEXT = 'Что-то пошло не так. Пожалуйста, попробуйте позже';
export const DEFAULT_PHONE_NUMBER_VALUE = '+380';
export const IS_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
export const TRANSLATIONS_MAP = {
  [OrderStatusEnum.NEW]: 'Новый',
  [OrderStatusEnum.PROCESSING]: 'Обрабатывается',
  [OrderStatusEnum.READY_TO_PACK]: 'Готово к упаковке',
  [OrderStatusEnum.PACKED]: 'Упакован',
  [OrderStatusEnum.READY_TO_SHIP]: 'Готово к отправке',
  [OrderStatusEnum.SHIPPED]: 'Отправлен',
  [OrderStatusEnum.FINISHED]: 'Завершён',
  [OrderStatusEnum.RECIPIENT_DENIED]: 'Получатель отказался',
  [OrderStatusEnum.RETURNING]: 'Возвращается',
  [OrderStatusEnum.RETURNED]: 'Возвращён',
  [OrderStatusEnum.REFUSED_TO_RETURN]: 'Отказ от возврата',
  [OrderStatusEnum.CANCELED]: 'Отменён',
  [ShipmentStatusEnum.AWAITING_TO_BE_RECEIVED_FROM_SENDER]: 'Ожидает поступление',
  [ShipmentStatusEnum.DELETED]: 'Удалено',
  [ShipmentStatusEnum.NOT_FOUND]: 'Не найдено',
  [ShipmentStatusEnum.IN_CITY]: 'В городе',
  [ShipmentStatusEnum.HEADING_TO_CITY]: 'Направляется в город',
  [ShipmentStatusEnum.IN_DESTINATION_CITY]: 'В городе прибытия',
  [ShipmentStatusEnum.IN_DESTINATION_WAREHOUSE]: 'В отделении прибытия',
  [ShipmentStatusEnum.RECEIVED]: 'Получено',
  [ShipmentStatusEnum.AWAITING_CASH_ON_DELIVERY_PICK_UP]: 'Ожидает забора наложенного',
  [ShipmentStatusEnum.CASH_ON_DELIVERY_PICKED_UP] : 'Наложенный забран',
  [ShipmentStatusEnum.UNDER_INSPECTION]: 'Осматривается',
  [ShipmentStatusEnum.HEADING_TO_RECIPIENT]: 'Направляется к получателю',
  [ShipmentStatusEnum.RECIPIENT_DENIED]: 'Получатель отказался',
  [ShipmentStatusEnum.ADDRESS_CHANGED]: 'Адрес изменился',
  [ShipmentStatusEnum.STORAGE_STOPPED]: 'Хранение остановлено',
  [ShipmentStatusEnum.BACK_DELIVERY_CREATED]: 'Создана обратная доставка',
  [ShipmentStatusEnum.STATUS_NOT_SUPPORTED]: 'Статус не поддерживается',
  [EProductsSort.Popularity]: 'Популярные',
  [EProductsSort.New]: 'Новые в начале',
  [EProductsSort.Cheap]: 'От дешёвых к дорогим',
  [EProductsSort.Expensive]: 'От дорогих к дешёвым',
  [Role.Owner]: 'Owner',
  [Role.Administrator]: 'Администратор',
  [Role.SeniorManager]: 'Старший менеджер',
  [Role.Manager]: 'Менеджер'
};
export const MANAGER_SELECT_OPTIONS: ISelectOption[] = [
  { data: '5ef9c63aae2fd882393081c3', view: 'Елена' },
  { data: '5fff628d7db0790020149858', view: 'Кристина' }
];
