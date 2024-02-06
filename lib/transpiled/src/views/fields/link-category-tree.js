define("views/fields/link-category-tree", ["exports", "views/fields/link"], function (_exports, _link) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _link = _interopRequireDefault(_link);
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

  class LinkCategoryTreeFieldView extends _link.default {
    selectRecordsView = 'views/modals/select-category-tree-records';
    autocompleteDisabled = false;
    fetchSearch() {
      const data = super.fetchSearch();
      if (!data) {
        return data;
      }
      if (data.typeFront === 'is') {
        data.field = this.name;
        data.type = 'inCategory';
      }
      return data;
    }
    getUrl() {
      const id = this.model.get(this.idName);
      if (!id) {
        return null;
      }
      return '#' + this.entityType + '/list/categoryId=' + id;
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = LinkCategoryTreeFieldView;
  _exports.default = _default;
});
//# sourceMappingURL=link-category-tree.js.map ;