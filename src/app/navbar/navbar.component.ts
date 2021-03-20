import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';


export interface INavBarItem {
  name: string;
  link: string;
  icon: string;
  isChildrenVisible?: boolean;
  isPinned?: boolean;
  subItems?: INavBarItem[];
}


@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public navBarMenu: INavBarItem[] = navBarMenu;
  private storagePinnedStateKey = 'navbar-pinned-links';

  constructor(private location: Location) { }

  ngOnInit() {
    this.setPinnedState();
  }

  private getItemsWithChildren(): INavBarItem[] {
    return this.navBarMenu.filter(item => {
      if (item.hasOwnProperty('isChildrenVisible')) {
        return item;
      }
    });
  }

  public isChildActive(item: INavBarItem): boolean {
    return item.subItems?.some(subItem => {
      return this.location.isCurrentPathEqualTo(subItem.link) && !subItem.isPinned;
    });
  }

  public showSubItems(clickedItem: INavBarItem) {
    const itemsWithChildren = this.getItemsWithChildren();
    itemsWithChildren.find(item => {
      if (item === clickedItem) {
        item.isChildrenVisible = !item.isChildrenVisible;
      } else {
        item.isChildrenVisible = false;
      }
    });
  }

  public onSubItemClickHandler(clickedMenuItem: INavBarItem) {
    clickedMenuItem.isChildrenVisible = false;
  }

  public closeSubItems() {
    const itemsWithChildren = this.getItemsWithChildren();
    itemsWithChildren.forEach(item => {
      item.isChildrenVisible = false;
    });
  }

  public getPinnedItems() {
    const pinnedItems: INavBarItem[] = [];
    this.navBarMenu.forEach(item => {
      item.subItems?.forEach(subItem => {
        if (subItem.isPinned) {
          pinnedItems.push(subItem);
        }
      });
    });

    return pinnedItems;
  }

  public togglePinnedItem(subItem: INavBarItem) {
    subItem.isPinned = !subItem.isPinned;

    const pinnedItemLinks = this.getPinnedItems().map(item => item.link);
    localStorage.setItem(this.storagePinnedStateKey, JSON.stringify(pinnedItemLinks));
  }

  private setPinnedState() {
    const pinnedItemLinks: string[] = JSON.parse(localStorage.getItem(this.storagePinnedStateKey)) || [];
    const setState = (item: INavBarItem) => {
      if (pinnedItemLinks.includes(item.link)) {
        item.isPinned = true;
      }
      item.subItems?.forEach(setState);
    };

    this.navBarMenu.forEach(setState);
  }
}

const navBarMenu = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: 'navbar__icon ai ai-dashboard'
  },
  {
    name: 'Продажи',
    link: '',
    icon: 'navbar__icon ai ai-sales',
    isChildrenVisible: false,
    subItems: [
      {
        name: 'Заказы',
        link: '/admin/order',
        icon: 'navbar__icon ai ai-sales'
      },
      {
        name: 'Способы оплаты',
        link: '/admin/payment-method',
        icon: 'navbar__icon ai ai-sales'
      }
    ]
  },
  {
    name: 'Каталог',
    link: '',
    icon: 'navbar__icon ai ai-catalog',
    isChildrenVisible: false,
    subItems: [
      {
        name: 'Категории',
        link: '/admin/category',
        icon: 'navbar__icon ai ai-catalog'
      },
      {
        name: 'Товары',
        link: '/admin/product',
        icon: 'navbar__icon ai ai-catalog'
      },
      {
        name: 'Атрибуты товаров',
        link: '/admin/attribute',
        icon: 'navbar__icon ai ai-catalog'
      },
      {
        name: 'Доп. услуги',
        link: '/admin/additional-service',
        icon: 'navbar__icon ai ai-catalog'
      },
      {
        name: 'Агрегаторы',
        link: '/admin/aggregator',
        icon: 'navbar__icon ai ai-catalog'
      },
    ]
  },
  {
    name: 'Блог посты',
    link: '/admin/blog-post',
    icon: 'navbar__icon ai ai-content'
  },
  {
    name: 'Клиенты',
    link: '/admin/customer',
    icon: 'navbar__icon ai ai-customers'
  },
  {
    name: 'Отзывы',
    link: '',
    icon: 'navbar__icon ai ai-marketing',
    isChildrenVisible: false,
    subItems: [
      {
        name: 'Отзывы о магазине',
        link: '/admin/store-review',
        icon: 'navbar__icon ai ai-marketing'
      },
      {
        name: 'Отзывы о товарах',
        link: '/admin/product-review',
        icon: 'navbar__icon ai ai-marketing'
      }
    ]
  },
  {
    name: 'Система',
    link: '',
    icon: 'navbar__icon ai ai-system',
    isChildrenVisible: false,
    subItems: [
      {
        name: 'Объявление',
        link: '/admin/announcement',
        icon: 'navbar__icon ai ai-system'
      },
      {
        name: 'Баннер',
        link: '/admin/banner',
        icon: 'navbar__icon ai ai-system'
      },
      {
        name: 'Emails',
        link: '/admin/emails-test',
        icon: 'navbar__icon ai ai-system'
      },
      {
        name: 'Валюты',
        link: '/admin/currency',
        icon: 'navbar__icon ai ai-system'
      },
      {
        name: 'Админы',
        link: '/admin/users',
        icon: 'navbar__icon ai ai-system'
      }
    ]
  }
];
