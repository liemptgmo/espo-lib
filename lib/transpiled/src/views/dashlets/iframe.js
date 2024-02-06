define("views/dashlets/iframe", ["exports", "views/dashlets/abstract/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class IframeDashletView extends _base.default {
    name = 'Iframe';
    templateContent = '<iframe style="margin: 0; border: 0;"></iframe>';
    afterRender() {
      const $iframe = this.$el.find('iframe');
      const url = this.getOption('url');
      if (url) {
        $iframe.attr('src', url);
      }
      this.$el.addClass('no-padding');
      this.$el.css('overflow', 'hidden');
      const height = this.$el.height();
      $iframe.css('height', height);
      $iframe.css('width', '100%');
    }
    afterAdding() {
      this.getContainerView().actionOptions();
    }
  }
  var _default = IframeDashletView;
  _exports.default = _default;
});
//# sourceMappingURL=iframe.js.map ;