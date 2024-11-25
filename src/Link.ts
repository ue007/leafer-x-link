import { MoveEvent, } from '@leafer-ui/core'
import { Arrow } from '@leafer-in/arrow'
import { IConnectorOption, IConnectorType, ISideType, IDirection, ConnectorTarget, IConnectorPoint } from './Interfaces'

import { ILayoutBoundsData, IPointData } from '@leafer/interface/types'
import { QnConnectorProxy } from './Proxy';
import { calcAngle, calcDistance } from './util';
import { TargetObj } from './TargetObj';

export class Link extends Arrow {
  [key: string | symbol]: any;
  obj1: TargetObj;
  obj2: TargetObj;
  opt: IConnectorOption
  path: string = ""
  // renderCount: number
  type: IConnectorType
  direction: IDirection  // 两对象之间的方向

  constructor(target1: ConnectorTarget, target2: ConnectorTarget, opt?: IConnectorOption) {
    super();

    this.obj1 = new TargetObj(target1, opt, opt?.opt1);
    this.obj2 = new TargetObj(target2, opt, opt?.opt2);
    
    this.opt = opt;
    this.type = opt?.type || 'default';
    this.name = opt?.name;

    this.strokeWidth = 3;
    this.stroke = 'rgb(255,0,0)';
    this.direction = this.setDirection(target1, target2);
   
    const that = this;

    target1.on(MoveEvent.DRAG, function (e: PointerEvent) {
      if (e.type === MoveEvent.DRAG) {
        that._generatePath();
      }
    });

    target2.on(MoveEvent.DRAG, function (e: PointerEvent) {
      if (e.type === MoveEvent.DRAG) {
        that._generatePath()
      }
    });

    // this.points = [0, 90, 20, 60, 40, 80, 60, 40, 75, 50, 90, 10, 100, 90];
    // this.curve = true;
    this._generatePath();

    // 在构造函数的末尾返回一个代理对象
    return new Proxy(this, {
      set: (target, property, newValue, receiver) => QnConnectorProxy(target, property, newValue, receiver)
    });

  }

  calculatePath(s: IConnectorPoint, e: IConnectorPoint): string {
    let points = [];
    let s1 = `M ${s.linkPoint.x} ${s.linkPoint.y}`
    points.push(s.linkPoint.x,s.linkPoint.y);

    let s2 = ` L ${s.padding.x} ${s.padding.y}`
    points.push(s.padding.x,s.padding.y);
    if (s.pathPoint?.x && s.pathPoint?.y) {
      s2 += ` L ${s.pathPoint.x} ${s.pathPoint.y}`
      points.push(s.pathPoint.x,s.pathPoint.y);
    }

    let e2 = ''
    if (e.pathPoint?.x && e.pathPoint?.y) {
      e2 = ` L ${e.pathPoint.x} ${e.pathPoint.y}`
      points.push(e.pathPoint.x,e.pathPoint.y);
    }
    e2 += ` L ${e.padding.x} ${e.padding.y}`
    points.push(e.padding.x,e.padding.y);
    let e1 = ` L ${e.linkPoint.x} ${e.linkPoint.y}`
    points.push(e.linkPoint.x,e.linkPoint.y);
    this.points = points;
    
    return `${s1}${s2}${e2}${e1}`
  }

  // 添加setDirection方法,ract1对ract2的方向
  setDirection: (r1: ConnectorTarget, r2: ConnectorTarget) => IDirection = (r1, r2) => {
    const center1 = {
      x: r1.x + r1.width / 2,
      y: r1.y + r1.height / 2
    };
    const center2 = {
      x: r2.x + r2.width / 2,
      y: r2.y + r2.height / 2
    };

    // 比较中心点来确定方向
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;

    var vertical = ''
    var horizontal = ''
    if (dy > 0) {
      vertical = 'b'
    } else if (dy < 0) {
      vertical = 't'
    }
    if (dx > 0) {
      horizontal = 'r'
    } else if (dx < 0) {
      horizontal = 'l'
    }
    return (vertical + horizontal) as IDirection
  }

  checkInSide(p: IPointData, bound: ILayoutBoundsData): boolean {
    let x1 = bound.x
    let x2 = bound.x + bound.width
    let y1 = bound.y
    let y2 = bound.y + bound.height
    let isX = p.x >= x1 && p.x <= x2
    let isY = p.y >= y1 && p.y <= y2

    return !(isX && isY)
  }

  // 根据属性,获取有效连接点
  setValidSide(): void {
    let bound1 = this.obj1.getBounds(this.obj1.padding + this.obj1.margin)
    let bound2 = this.obj2.getBounds(this.obj2.padding + this.obj2.margin)
    let obj1: ISideType[] = []
    let obj2: ISideType[] = []
    this.checkInSide(bound1.t, bound2.bounds) && obj1.push('t')
    this.checkInSide(bound1.b, bound2.bounds) && obj1.push('b')
    this.checkInSide(bound1.l, bound2.bounds) && obj1.push('l')
    this.checkInSide(bound1.r, bound2.bounds) && obj1.push('r')

    this.checkInSide(bound2.t, bound1.bounds) && obj2.push('t')
    this.checkInSide(bound2.b, bound1.bounds) && obj2.push('b')
    this.checkInSide(bound2.l, bound1.bounds) && obj2.push('l')
    this.checkInSide(bound2.r, bound1.bounds) && obj2.push('r')

    this.validSide = {
      obj1,
      obj2,
    }
  }

  _generatePath() {
    // this.renderCount = 0
    this.setValidSide();
    
    var pdPoints1 = this.obj1.updateValidPoints(this.obj2)
    var pdPoints2 = this.obj2.updateValidPoints(this.obj1)
    
    if (pdPoints1.length == 0 || pdPoints2.length == 0) {
      this.path = 'M 0 0 Z'
      return;
    }

    var distance = 0
    var point1, point2: IConnectorPoint;

    for (const p1 of pdPoints1) {
      for (const p2 of pdPoints2) {
        let d2 = calcDistance(p1.padding, p2.padding)
        if (distance == 0 || distance > d2) {
          distance = d2
          point1 = p1
          point2 = p2
        }
      }
    }
    point1.angle = calcAngle(point1.anglePoint, point1.padding, point2.padding)
    point2.angle = calcAngle(point2.anglePoint, point2.padding, point1.padding)
    
    const getLen: (a: number, b: number) => number = (a, b) => {
      if (a > b) {
        return a - b
      } else {
        return b - a

      }
    }
    let validAngle1 = point1.angle < 90 || point1.angle > 270
    let validAngle2 = point2.angle < 90 || point2.angle > 270
    if (validAngle1 || validAngle2) {
      let horizontal = getLen(point1.padding.x, point2.padding.x)
      let vertical = getLen(point1.padding.y, point2.padding.y)
      if (horizontal < vertical) {
        // 水平延伸补偿
        if (point1.side == point2.side) { //相同方向
          if (validAngle1) {
            // console.log(`水平11::`,horizontal)
            point2.pathPoint = {
              y: point2.padding.y,
              x: point2.padding.x + (point2.padding.x > point1.padding.x ? -horizontal : horizontal),
            }
          } else {
            // console.log(`水平22::`,horizontal)
            point1.pathPoint = {
              y: point1.padding.y,
              x: point1.padding.x + (point1.padding.x > point2.padding.x ? -horizontal : horizontal),
            }
          }
        } else {
          if (['b', 't'].indexOf(point1.side) > -1) {
            // console.log(`水平33::`,horizontal)
            point1.pathPoint = {
              y: point1.padding.y,
              x: point1.padding.x + (point1.padding.x > point2.padding.x ? -horizontal : horizontal),
            }
          } else {
            // console.log(`水平44::`,horizontal)
            point2.pathPoint = {
              y: point2.padding.y,
              x: point2.padding.x + (point2.padding.x > point1.padding.x ? -horizontal : horizontal),
            }
          }
        }
      } else {
        // console.log(`垂直::`,vertical)
        // 垂直延伸补偿
        if (point1.side == point2.side) { //相同方向
          if (validAngle1) {
            // console.log(`垂直11::`,vertical)
            point2.pathPoint = {
              x: point2.padding.x,
              y: point2.padding.y + (point2.padding.y > point1.padding.y ? -vertical : vertical),
            }
          } else {
            // console.log(`垂直22::`,vertical)
            point1.pathPoint = {
              x: point1.padding.x,
              y: point1.padding.y + (point1.padding.y > point2.padding.y ? -vertical : vertical),
            }
          }
        } else {
          if (['r', 'l'].indexOf(point1.side) > -1) {
            // console.log(`垂直33::`,vertical)
            point1.pathPoint = {
              x: point1.padding.x,
              y: point1.padding.y + (point1.padding.y > point2.padding.y ? -vertical : vertical),
            }
          } else {
            // console.log(`垂直44::`,vertical)
            point2.pathPoint = {
              x: point2.padding.x,
              y: point2.padding.y + (point2.padding.y > point1.padding.y ? -vertical : vertical),
            }
          }
        }
      }
    }

    // this.calculatePath(point1, point2);
    this.path = this.calculatePath(point1, point2);
    // this.path = 'M945.344 586.304c-13.056-93.44-132.48-98.048-132.48-98.048 0-29.888-39.808-47.424-39.808-47.424L201.664 440.832c-36.736 0-42.112 51.264-42.112 51.264 7.68 288 181.44 382.976 181.44 382.976l299.456 0c42.88-31.36 101.888-122.56 101.888-122.56 9.216 3.072 72.768-0.832 97.984-6.144C865.6 740.992 958.336 679.68 945.344 586.304zM365.568 825.28c-145.472-105.664-130.944-328.576-130.944-328.576l80.448 0c-44.416 126.4 43.648 285.696 55.872 307.904C383.232 826.816 365.568 825.28 365.568 825.28zM833.472 694.272c-37.568 22.272-65.152 7.68-65.152 7.68 39.04-54.4 42.112-159.296 42.112-159.296 6.848 2.304 12.288-26.048 61.312 23.744C920.768 616.128 871.04 672.064 833.472 694.272z M351.68 129.856c0 0-119.424 72.832-44.416 140.928 75.008 68.16 68.16 93.44 24.512 153.216 0 0 81.92-41.344 71.168-104.192s-89.6-94.208-72.768-137.792C347.136 138.304 351.68 129.856 351.68 129.856z M615.232 91.648c0 0-119.488 72.832-44.352 140.928 74.944 68.16 68.032 93.44 24.448 153.216 0 0 81.984-41.344 71.232-104.192-10.688-62.784-89.6-94.208-72.832-137.792C610.624 100.032 615.232 91.648 615.232 91.648z M491.136 64c0 0-74.304 6.144-88.128 78.144C389.248 214.144 435.968 240.96 471.936 276.992 507.904 312.96 492.608 380.352 452.032 427.904c0 0 72.768-25.344 89.6-94.976 16.832-69.76-17.344-94.272-52.8-134.784C453.312 157.504 456.64 83.968 491.136 64z';
    // this.points = [0, 90, 20, 60, 40, 80, 60, 40, 75, 50, 90, 10, 100, 90];
    
    if (typeof (this.opt?.onDraw) == 'function') {   
      this.path = this.opt.onDraw({
        s: point1,
        e: point2,
        path: this.path,
        source:this,
      });
    }
    this.startArrow = this.obj1.arrowType;
    this.endArrow = this.obj2.arrowType;
  }
}
