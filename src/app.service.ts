import { Injectable } from '@nestjs/common';
import randomstring = require('randomstring');
import slugify from 'slugify';

@Injectable()
export class AppService {
  getHello() {
    return 'Welcome to Restfull Api deBlog';
  }
}
