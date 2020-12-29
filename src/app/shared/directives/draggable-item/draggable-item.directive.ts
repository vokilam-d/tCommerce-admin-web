import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2
} from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { EReorderPosition } from '../../enums/reorder-position.enum';

export interface IDraggedEvent<T = any> {
  item: T;
  targetItem: T;
  position: EReorderPosition;
}

@Directive({
  selector: '[draggable-item]'
})
export class DraggableItemDirective implements AfterViewInit, OnDestroy {

  isHovered: { [key in EReorderPosition]: boolean } = {
    [EReorderPosition.Inside]: false,
    [EReorderPosition.Start]: false,
    [EReorderPosition.End]: false
  };

  private mouseMoveUnlisten: () => void = null;

  @HostBinding('class.draggable-item--is-dragging')   isDragging: boolean = false;
  @HostBinding('class.draggable-item--body-hovered')  get isBodyHovered() { return this.isHovered[EReorderPosition.Inside]; }
  @HostBinding('class.draggable-item--start-hovered') get isStartHovered() { return this.isHovered[EReorderPosition.Start]; }
  @HostBinding('class.draggable-item--end-hovered')   get isEndHovered() { return this.isHovered[EReorderPosition.End]; }
  @HostBinding('class.draggable-item--vertical')      get isVertical() { return this.direction === 'vertical'; }
  @HostBinding('class.draggable-item--horizontal')    get isHorizontal() { return this.direction === 'horizontal'; }

  @Input('draggable-item') item: any;
  @Input('draggable-item-type') type: string;
  @Input('draggable-item-direction') direction: 'vertical' | 'horizontal' = 'vertical';
  @Output() dragged = new EventEmitter<IDraggedEvent>();

  constructor(
    private dragService: DraggableService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) { }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
  }

  @HostListener('mousedown', ['$event'])
  onDragStart(_) {
    this.isDragging = true;
    this.dragService.setDraggingItem(this.type, this.item);

    const mouseUpUnlisten = this.renderer.listen('window', 'mouseup', _ => {
      this.isDragging = false;
      this.dragService.removeDraggingItem();
      this.resetHovered();

      if (mouseUpUnlisten) { mouseUpUnlisten(); }
      if (this.mouseMoveUnlisten) { this.mouseMoveUnlisten(); }
    });
  }

  @HostListener('mouseup', ['$event'])
  onDragStop(mouseUpEvt) {
    const currentlyDraggingItem = this.dragService.getDraggingItem(this.type);
    if (!currentlyDraggingItem) { return; }

    if (currentlyDraggingItem !== this.item) {
      this.dragged.emit({
        item: currentlyDraggingItem,
        targetItem: this.item,
        position: this.getPosition(mouseUpEvt)
      });
    }

    this.resetHovered();
  }

  @HostListener('mousemove', ['$event'])
  onDrag(mouseMoveEvt: MouseEvent) {
    const currentlyDraggingItem = this.dragService.getDraggingItem(this.type);
    if (!currentlyDraggingItem || currentlyDraggingItem === this.item) { return; }

    const position = this.getPosition(mouseMoveEvt);
    this.setHovered(position);

    if (!this.mouseMoveUnlisten) {
      this.mouseMoveUnlisten = this.renderer.listen('window', 'mouseup', _ => {
        this.resetHovered();
        if (this.mouseMoveUnlisten) {
          this.mouseMoveUnlisten();
          this.mouseMoveUnlisten = null;
        }
      });
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(_) {
    this.resetHovered();
    if (this.mouseMoveUnlisten) { this.mouseMoveUnlisten(); }
  }

  private setHovered(position: EReorderPosition) {
    this.resetHovered();
    this.isHovered[position] = true;
  }

  private resetHovered() {
    Object.keys(this.isHovered).forEach(position => this.isHovered[position] = false);
  }

  private getPosition(mouseEvt: MouseEvent): EReorderPosition {
    let dimension;
    let offset;
    let section;

    if (this.direction === 'vertical') {
      dimension = this.elementRef.nativeElement.offsetHeight;
      offset = Math.abs(mouseEvt.offsetY);
      section = dimension / 4;
    } else if (this.direction === 'horizontal') {
      dimension = this.elementRef.nativeElement.offsetWidth;
      offset = Math.abs(mouseEvt.offsetX);
      section = dimension / 2;
    }

    if (offset <= section) {
      return EReorderPosition.Start;
    } else if (offset <= (dimension - section)) {
      return EReorderPosition.Inside;
    } else {
      return EReorderPosition.End;
    }
  }
}
