define("views/modals/select-category-tree-records", ["exports", "views/modals/select-records"], function (_exports, _selectRecords) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _selectRecords = _interopRequireDefault(_selectRecords);
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

  class SelectCategoryTreeRecordsModalView extends _selectRecords.default {
    setup() {
      /** @type {Object.<string, module:search-manager~advancedFilter>} */
      this.filters = this.options.filters || {};
      /** @type {Object.<string, boolean>} */
      this.boolFilterList = this.options.boolFilterList || {};
      this.primaryFilterName = this.options.primaryFilterName || null;
      if ('multiple' in this.options) {
        this.multiple = this.options.multiple;
      }
      this.createButton = false;
      this.massRelateEnabled = this.options.massRelateEnabled;
      this.buttonList = [{
        name: 'cancel',
        label: 'Cancel'
      }];
      if (this.multiple) {
        this.buttonList.unshift({
          name: 'select',
          style: 'danger',
          label: 'Select',
          onClick: dialog => {
            const listView = this.getRecordView();
            if (listView.allResultIsChecked) {
              this.trigger('select', {
                massRelate: true,
                where: this.collection.getWhere(),
                searchParams: this.collection.data
              });
            } else {
              const list = listView.getSelected();
              if (list.length) {
                this.trigger('select', list);
              }
            }
            dialog.close();
          }
        });
      }
      this.scope = this.options.scope;
      this.$header = $('<span>');
      this.$header.append($('<span>').text(this.translate('Select') + ': ' + this.getLanguage().translate(this.scope, 'scopeNamesPlural')));
      this.$header.prepend(this.getHelper().getScopeColorIconHtml(this.scope));
      this.waitForView('list');
      Espo.loader.require('search-manager', SearchManager => {
        this.getCollectionFactory().create(this.scope, collection => {
          collection.maxSize = this.getConfig().get('recordsPerPageSelect') || 5;
          this.collection = collection;
          const searchManager = new SearchManager(collection, 'listSelect', null, this.getDateTime());
          searchManager.emptyOnReset = true;
          if (this.filters) {
            searchManager.setAdvanced(this.filters);
          }
          if (this.boolFilterList) {
            searchManager.setBool(this.boolFilterList);
          }
          if (this.primaryFilterName) {
            searchManager.setPrimary(this.primaryFilterName);
          }
          collection.where = searchManager.getWhere();
          collection.url = collection.entityType + '/action/listTree';
          const viewName = this.getMetadata().get('clientDefs.' + this.scope + '.recordViews.listSelectCategoryTree') || 'views/record/list-tree';
          this.listenToOnce(collection, 'sync', () => {
            this.createView('list', viewName, {
              collection: collection,
              fullSelector: this.containerSelector + ' .list-container',
              readOnly: true,
              selectable: true,
              checkboxes: this.multiple,
              massActionsDisabled: true,
              searchManager: searchManager,
              checkAllResultDisabled: true,
              buttonsDisabled: true
            }, listView => {
              listView.once('select', model => {
                this.trigger('select', model);
                this.close();
              });
            });
          });
          collection.fetch();
        });
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = SelectCategoryTreeRecordsModalView;
  _exports.default = _default;
});
//# sourceMappingURL=select-category-tree-records.js.map ;