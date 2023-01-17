import { Injectable } from '@nestjs/common';
import randomstring = require('randomstring');
import slugify from 'slugify';

@Injectable()
export class AppService {
  getHello() {
    const randomstr = slugify('ello from kasa');

    return randomstr;
  }
}
