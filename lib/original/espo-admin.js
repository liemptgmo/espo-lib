define("views/admin/layouts/base", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
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

  /** @module module:views/admin/layouts/base */

  class LayoutBaseView extends _view.default {
    /**
     * @type {string}
     */
    scope;
    /**
     * @type {string}
     */
    type;
    events = {
      /** @this LayoutBaseView */
      'click button[data-action="save"]': function () {
        this.actionSave();
      },
      /** @this LayoutBaseView */
      'click button[data-action="cancel"]': function () {
        this.cancel();
      },
      /** @this LayoutBaseView */
      'click button[data-action="resetToDefault"]': function () {
        this.confirm(this.translate('confirmation', 'messages'), () => {
          this.resetToDefault();
        });
      },
      /** @this LayoutBaseView */
      'click button[data-action="remove"]': function () {
        this.actionDelete();
      }
    };
    buttonList = [{
      name: 'save',
      label: 'Save',
      style: 'primary'
    }, {
      name: 'cancel',
      label: 'Cancel'
    }];

    // noinspection JSUnusedGlobalSymbols
    dataAttributes = null;
    dataAttributesDefs = null;
    dataAttributesDynamicLogicDefs = null;
    setup() {
      this.buttonList = _.clone(this.buttonList);
      this.events = _.clone(this.events);
      this.scope = this.options.scope;
      this.type = this.options.type;
      this.realType = this.options.realType;
      this.setId = this.options.setId;
      this.em = this.options.em;
      const defs = this.getMetadata().get(['clientDefs', this.scope, 'additionalLayouts', this.type]) ?? {};
      this.typeDefs = defs;
      this.dataAttributeList = Espo.Utils.clone(defs.dataAttributeList || this.dataAttributeList);
      this.isCustom = !!defs.isCustom;
      if (this.isCustom && this.em) {
        this.buttonList.push({
          name: 'remove',
          label: 'Remove'
        });
      }
      if (!this.isCustom) {
        this.buttonList.push({
          name: 'resetToDefault',
          label: 'Reset to Default'
        });
      }
    }
    actionSave() {
      this.disableButtons();
      Espo.Ui.notify(this.translate('saving', 'messages'));
      this.save(this.enableButtons.bind(this));
    }
    disableButtons() {
      this.$el.find('.button-container button').attr('disabled', 'disabled');
    }
    enableButtons() {
      this.$el.find('.button-container button').removeAttr('disabled');
    }
    setConfirmLeaveOut(value) {
      this.getRouter().confirmLeaveOut = value;
    }
    setIsChanged() {
      this.isChanged = true;
      this.setConfirmLeaveOut(true);
    }
    setIsNotChanged() {
      this.isChanged = false;
      this.setConfirmLeaveOut(false);
    }
    save(callback) {
      const layout = this.fetch();
      if (!this.validate(layout)) {
        this.enableButtons();
        return false;
      }
      this.getHelper().layoutManager.set(this.scope, this.type, layout, () => {
        Espo.Ui.success(this.translate('Saved'));
        this.setIsNotChanged();
        if (typeof callback === 'function') {
          callback();
        }
        this.getHelper().broadcastChannel.postMessage('update:layout');
      }, this.setId).catch(() => this.enableButtons());
    }
    resetToDefault() {
      this.getHelper().layoutManager.resetToDefault(this.scope, this.type, () => {
        this.loadLayout(() => {
          this.setIsNotChanged();
          this.prepareLayout().then(() => this.reRender());
        });
      }, this.options.setId);
    }
    prepareLayout() {
      return Promise.resolve();
    }
    reset() {
      this.render();
    }
    fetch() {}
    unescape(string) {
      if (string === null) {
        return '';
      }
      const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'"
      };
      const reg = new RegExp('(' + _.keys(map).join('|') + ')', 'g');
      return ('' + string).replace(reg, match => {
        return map[match];
      });
    }
    getEditAttributesModalViewOptions(attributes) {
      return {
        name: attributes.name,
        scope: this.scope,
        attributeList: this.dataAttributeList,
        attributeDefs: this.dataAttributesDefs,
        dynamicLogicDefs: this.dataAttributesDynamicLogicDefs,
        attributes: attributes,
        languageCategory: this.languageCategory,
        headerText: ' '
      };
    }
    openEditDialog(attributes) {
      const name = attributes.name;
      const viewOptions = this.getEditAttributesModalViewOptions(attributes);
      this.createView('editModal', 'views/admin/layouts/modals/edit-attributes', viewOptions, view => {
        view.render();
        this.listenToOnce(view, 'after:save', attributes => {
          this.trigger('update-item', name, attributes);
          const $li = $("#layout ul > li[data-name='" + name + "']");
          for (const key in attributes) {
            $li.attr('data-' + key, attributes[key]);
            $li.data(key, attributes[key]);
            $li.find('.' + key + '-value').text(attributes[key]);
          }
          view.close();
          this.setIsChanged();
        });
      });
    }
    cancel() {
      this.loadLayout(() => {
        this.setIsNotChanged();
        if (this.em) {
          this.trigger('cancel');
          return;
        }
        this.prepareLayout().then(() => this.reRender());
      });
    }

    // noinspection JSUnusedLocalSymbols
    validate(layout) {
      return true;
    }
    actionDelete() {
      this.confirm(this.translate('confirmation', 'messages')).then(() => {
        this.disableButtons();
        Espo.Ui.notify(' ... ');
        Espo.Ajax.postRequest('Layout/action/delete', {
          scope: this.scope,
          name: this.type
        }).then(() => {
          Espo.Ui.success(this.translate('Removed'), {
            suppress: true
          });
          this.trigger('after-delete');
        }).catch(() => {
          this.enableButtons();
        });
      });
    }
  }
  var _default = LayoutBaseView;
  _exports.default = _default;
});

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

define('views/admin/layouts/rows', ['views/admin/layouts/base'], function (Dep) {

    return Dep.extend({

        template: 'admin/layouts/rows',

        dataAttributeList: null,
        dataAttributesDefs: {},
        editable: false,

        data: function () {
            return {
                scope: this.scope,
                type: this.type,
                buttonList: this.buttonList,
                enabledFields: this.enabledFields,
                disabledFields: this.disabledFields,
                layout: this.rowLayout,
                dataAttributeList: this.dataAttributeList,
                dataAttributesDefs: this.dataAttributesDefs,
                editable: this.editable,
            };
        },

        setup: function () {
            this.itemsData = {};

            Dep.prototype.setup.call(this);

            this.events['click a[data-action="editItem"]'] = e => {
                const name = $(e.target).closest('li').data('name');

                this.editRow(name);
            };

            this.on('update-item', (name, attributes) => {
                this.itemsData[name] = Espo.Utils.cloneDeep(attributes);
            });

            Espo.loader.require('res!client/css/misc/layout-manager-rows.css', styleCss => {
                this.$style = $('<style>').html(styleCss).appendTo($('body'));
            });
        },

        onRemove: function () {
            if (this.$style) {
                this.$style.remove();
            }
        },

        editRow: function (name) {
            const attributes = Espo.Utils.cloneDeep(this.itemsData[name] || {});
            attributes.name = name;

            this.openEditDialog(attributes)
        },

        afterRender: function () {
            $('#layout ul.enabled, #layout ul.disabled').sortable({
                connectWith: '#layout ul.connected',
                update: e => {
                    if (!$(e.target).hasClass('disabled')) {
                        this.onDrop(e);
                        this.setIsChanged();
                    }
                },
            });

            this.$el.find('.enabled-well').focus();
        },

        onDrop: function (e) {},

        fetch: function () {
            const layout = [];

            $("#layout ul.enabled > li").each((i, el) => {
                const o = {};

                const name = $(el).data('name');

                const attributes = this.itemsData[name] || {};
                attributes.name = name;

                this.dataAttributeList.forEach(attribute => {
                    const defs = this.dataAttributesDefs[attribute] || {};

                    if (defs.notStorable) {
                        return;
                    }

                    const value = attributes[attribute] || null;

                    if (value) {
                        o[attribute] = value;
                    }
                });

                layout.push(o);
            });

            return layout;
        },

        validate: function (layout) {
            if (layout.length === 0) {
                this.notify('Layout cannot be empty', 'error');

                return false;
            }

            return true;
        }
    });
});

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

define('views/admin/layouts/side-panels-detail', ['views/admin/layouts/rows'], function (Dep) {

    return Dep.extend({

        dataAttributeList: [
            'name',
            'dynamicLogicVisible',
            'style',
            'dynamicLogicStyled',
            'sticked',
        ],

        dataAttributesDefs: {
            dynamicLogicVisible: {
                type: 'base',
                view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                tooltip: 'dynamicLogicVisible',
            },
            style: {
                type: 'enum',
                options: [
                    'default',
                    'success',
                    'danger',
                    'warning',
                    'info',
                ],
                default: 'default',
                translation: 'LayoutManager.options.style',
                tooltip: 'panelStyle',
            },
            dynamicLogicStyled: {
                type: 'base',
                view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                tooltip: 'dynamicLogicStyled',
            },
            sticked: {
                type: 'bool',
                tooltip: 'sticked',
            },
            name: {
                readOnly: true,
            },
        },

        dataAttributesDynamicLogicDefs: {
            fields: {
                dynamicLogicStyled: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'and',
                                value: [
                                    {
                                        attribute: 'style',
                                        type: 'notEquals',
                                        value: 'default',
                                    },
                                    {
                                        attribute: 'style',
                                        type: 'isNotEmpty',
                                    },
                                ]
                            }

                        ]
                    }
                },
            }
        },

        editable: true,

        ignoreList: [],

        ignoreTypeList: [],

        viewType: 'detail',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.dataAttributesDefs = Espo.Utils.cloneDeep(this.dataAttributesDefs);

            this.dataAttributesDefs.dynamicLogicVisible.scope = this.scope;
            this.dataAttributesDefs.dynamicLogicStyled.scope = this.scope;

            this.wait(true);

            this.loadLayout(() => {
                this.wait(false);
            });
        },

        loadLayout: function (callback) {
            this.getHelper().layoutManager.getOriginal(this.scope, this.type, this.setId, (layout) => {
                this.readDataFromLayout(layout);

                if (callback) {
                    callback();
                }
            });
        },

        readDataFromLayout: function (layout) {
            var panelListAll = [];
            var labels = {};
            var params = {};

            layout = Espo.Utils.cloneDeep(layout);

            if (
                this.getMetadata().get(['clientDefs', this.scope, 'defaultSidePanel', this.viewType]) !== false &&
                !this.getMetadata().get(['clientDefs', this.scope, 'defaultSidePanelDisabled'])
            ) {
                panelListAll.push('default');

                labels['default'] = 'Default';
            }

            (this.getMetadata().get(['clientDefs', this.scope, 'sidePanels', this.viewType]) || [])
                .forEach(item => {
                    if (!item.name) {
                        return;
                    }

                    panelListAll.push(item.name);

                    if (item.label) {
                        labels[item.name] = item.label;
                    }
                    params[item.name] = item;
                });

            this.disabledFields = [];

            layout = layout || {};

            this.rowLayout = [];

            panelListAll.push('_delimiter_');

            if (!layout['_delimiter_']) {
                layout['_delimiter_'] = {
                    disabled: true,
                };
            }

            panelListAll.forEach((item, index) => {
                let disabled = false;
                let itemData = layout[item] || {};

                if (itemData.disabled) {
                    disabled = true;
                }

                if (!layout[item]) {
                    if ((params[item] || {}).disabled) {
                        disabled = true;
                    }
                }

                var labelText;

                if (labels[item]) {
                    labelText = this.getLanguage().translate(labels[item], 'labels', this.scope);
                } else {
                    labelText = this.getLanguage().translate(item, 'panels', this.scope);
                }

                if (disabled) {
                    let o = {
                        name: item,
                        label: labelText,
                    };

                    if (o.name[0] === '_') {
                        o.notEditable = true;

                        if (o.name === '_delimiter_') {
                            o.label = '. . .';
                        }
                    }

                    this.disabledFields.push(o);

                    return;
                }

                let o = {
                    name: item,
                    label: labelText,
                };

                if (o.name[0] === '_') {
                    o.notEditable = true;
                    if (o.name === '_delimiter_') {
                        o.label = '. . .';
                    }
                }

                if (o.name in params) {
                    this.dataAttributeList.forEach(attribute => {
                        if (attribute === 'name') {
                            return;
                        }

                        var itemParams = params[o.name] || {};

                        if (attribute in itemParams) {
                            o[attribute] = itemParams[attribute];
                        }
                    });
                }

                for (var i in itemData) {
                    o[i] = itemData[i];
                }

                o.index = ('index' in itemData) ? itemData.index : index;

                this.rowLayout.push(o);

                this.itemsData[o.name] = Espo.Utils.cloneDeep(o);
            });

            this.rowLayout.sort((v1, v2) => {
                return v1.index - v2.index;
            });
        },

        fetch: function () {
            let layout = {};

            $('#layout ul.disabled > li').each((i, el) => {
                var name = $(el).attr('data-name');

                layout[name] = {
                    disabled: true,
                };
            });

            $('#layout ul.enabled > li').each((i, el) => {
                let $el = $(el);
                let o = {};

                let name = $el.attr('data-name');

                let attributes = this.itemsData[name] || {};

                attributes.name = name;

                this.dataAttributeList.forEach(attribute => {
                    if (attribute === 'name') {
                        return;
                    }

                    if (attribute in attributes) {
                        o[attribute] = attributes[attribute];
                    }
                });

                o.index = i;

                layout[name] = o;
            })

            return layout;
        },
    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-base', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-base',

        data: function () {
            return {
                valueViewKey: this.getValueViewKey(),
                scope: this.scope,
                operator: this.operator,
                operatorString: this.operatorString,
                field: this.field,
                leftString: this.getLeftPartString(),
            };
        },

        setup: function () {
            this.itemData = this.options.itemData;

            this.level = this.options.level || 0;
            this.number = this.options.number || 0;
            this.scope = this.options.scope;

            this.operator = this.options.operator || this.operator;
            this.operatorString = this.options.operatorString || this.operatorString;

            this.additionalData = (this.itemData.data || {});

            this.field = (this.itemData.data || {}).field || this.itemData.attribute;

            this.wait(true);

            this.isCurrentUser = this.itemData.attribute && this.itemData.attribute.startsWith('$user.');

            if (this.isCurrentUser) {
                this.scope = 'User'
            }

            this.getModelFactory().create(this.scope, (model) => {
                this.model = model;

                this.populateValues();
                this.createValueFieldView();

                this.wait(false);
            });
        },

        getLeftPartString: function () {
            if (this.itemData.attribute === '$user.id') {
                return '$' + this.translate('User', 'scopeNames');
            }

            let label = this.translate(this.field, 'fields', this.scope);

            if (this.isCurrentUser) {
                label = '$' + this.translate('User', 'scopeNames') + '.' + label;
            }

            return label;
        },

        populateValues: function () {
            if (this.itemData.attribute) {
                this.model.set(this.itemData.attribute, this.itemData.value);
            }

            this.model.set(this.additionalData.values || {});
        },

        getValueViewKey: function () {
            return 'view-' + this.level.toString() + '-' + this.number.toString() + '-0';
        },

        getFieldValueView: function () {
            if (this.itemData.attribute === '$user.id') {
                return 'views/admin/dynamic-logic/fields/user-id';
            }

            const fieldType = this.getMetadata()
                .get(['entityDefs', this.scope, 'fields', this.field, 'type']) || 'base';

            return this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'view']) ||
                this.getFieldManager().getViewName(fieldType);
        },

        createValueFieldView: function () {
            const key = this.getValueViewKey();

            const viewName = this.getFieldValueView();

            this.createView('value', viewName, {
                model: this.model,
                name: this.field,
                selector: '[data-view-key="' + key + '"]',
            });
        },
    });
});

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

define('views/admin/layouts/grid', ['views/admin/layouts/base'], function (Dep) {

    return Dep.extend({

        template: 'admin/layouts/grid',

        dataAttributeList: null,
        panels: null,
        columnCount: 2,
        panelDataAttributeList: ['panelName', 'style'],
        panelDataAttributesDefs: {},
        panelDynamicLogicDefs: null,

        data: function () {
            return {
                scope: this.scope,
                type: this.type,
                buttonList: this.buttonList,
                enabledFields: this.enabledFields,
                disabledFields: this.disabledFields,
                panels: this.panels,
                columnCount: this.columnCount,
                panelDataList: this.getPanelDataList(),
            };
        },

        emptyCellTemplate:
            '<li class="empty disabled cell">' +
            '<a role="button" data-action="minusCell" class="remove-field"><i class="fas fa-minus"></i></a>' +
            '</li>',

        additionalEvents: {
            'click #layout a[data-action="addPanel"]': function () {
                this.addPanel();
                this.setIsChanged();
                this.makeDraggable();
            },
            'click #layout a[data-action="removePanel"]': function (e) {
                $(e.target).closest('ul.panels > li').find('ul.cells > li').each((i, li) => {
                    if ($(li).attr('data-name')) {
                        $(li).appendTo($('#layout ul.disabled'));
                    }
                });

                $(e.target).closest('ul.panels > li').remove();

                const number = $(e.currentTarget).data('number');
                this.clearView('panels-' + number);

                let index = -1;

                this.panels.forEach((item, i) => {
                    if (item.number === number) {
                        index = i;
                    }
                });

                if (~index) {
                    this.panels.splice(index, 1);
                }

                this.normalizeDisabledItemList();

                this.setIsChanged();
            },
            'click #layout a[data-action="addRow"]': function (e) {
                const tpl = this.unescape($("#layout-row-tpl").html());
                const html = _.template(tpl);

                $(e.target).closest('ul.panels > li').find('ul.rows').append(html);

                this.setIsChanged();
                this.makeDraggable();
            },
            'click #layout a[data-action="removeRow"]': function (e) {
                $(e.target).closest('ul.rows > li').find('ul.cells > li').each((i, li) => {
                    if ($(li).attr('data-name')) {
                        $(li).appendTo($('#layout ul.disabled'));
                    }
                });

                $(e.target).closest('ul.rows > li').remove();

                this.normalizeDisabledItemList();

                this.setIsChanged();
            },
            'click #layout a[data-action="removeField"]': function (e) {
                const $li = $(e.target).closest('li');
                const index = $li.index();
                const $ul = $li.parent();

                $li.appendTo($('ul.disabled'));

                const $empty = $($('#empty-cell-tpl').html());

                if (parseInt($ul.attr('data-cell-count')) === 1) {
                    for (let i = 0; i < this.columnCount; i++) {
                        $ul.append($empty.clone());
                    }
                } else {
                    if (index === 0) {
                        $ul.prepend($empty);
                    } else {
                        $empty.insertAfter($ul.children(':nth-child(' + index + ')'));
                    }
                }

                const cellCount = $ul.children().length;
                $ul.attr('data-cell-count', cellCount.toString());
                $ul.closest('li').attr('data-cell-count', cellCount.toString());

                this.setIsChanged();

                this.makeDraggable();
            },
            'click #layout a[data-action="minusCell"]': function (e) {
                if (this.columnCount < 2) {
                    return;
                }

                const $li = $(e.currentTarget).closest('li');
                const $ul = $li.parent();

                $li.remove();

                const cellCount = parseInt($ul.children().length || 2);

                this.setIsChanged();

                this.makeDraggable();

                $ul.attr('data-cell-count', cellCount.toString());
                $ul.closest('li').attr('data-cell-count', cellCount.toString());
            },
            'click #layout a[data-action="plusCell"]': function (e) {
                const $li = $(e.currentTarget).closest('li');
                const $ul = $li.find('ul');

                const $empty = $($('#empty-cell-tpl').html());

                $ul.append($empty);

                const cellCount = $ul.children().length;

                $ul.attr('data-cell-count', cellCount.toString());
                $ul.closest('li').attr('data-cell-count', cellCount.toString());

                this.setIsChanged();

                this.makeDraggable();
            },
            'click #layout a[data-action="edit-panel-label"]': function (e) {
                const $header = $(e.target).closest('header');
                const $label = $header.children('label');
                const panelName = $label.text();

                const id = $header.closest('li').data('number').toString();

                const attributes = {
                    panelName: panelName,
                };

                this.panelDataAttributeList.forEach((item) => {
                    if (item === 'panelName') {
                        return;
                    }

                    attributes[item] = this.panelsData[id][item];
                });

                const attributeList = this.panelDataAttributeList;
                const attributeDefs = this.panelDataAttributesDefs;

                this.createView('dialog', 'views/admin/layouts/modals/panel-attributes', {
                    attributeList: attributeList,
                    attributeDefs: attributeDefs,
                    attributes: attributes,
                    dynamicLogicDefs: this.panelDynamicLogicDefs,
                }, (view) => {
                    view.render();

                    this.listenTo(view, 'after:save', (attributes) => {
                        $label.text(attributes.panelName);
                        $label.attr('data-is-custom', 'true');

                        this.panelDataAttributeList.forEach((item) => {
                            if (item === 'panelName') {
                                return;
                            }

                            this.panelsData[id][item] = attributes[item];
                        });

                        view.close();

                        this.$el.find('.well').focus();

                        this.setIsChanged();
                    });
                });
            }
        },

        normalizeDisabledItemList: function () {
            //$('#layout ul.cells.disabled > li').each((i, el) => {});
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.events = {
                ...this.additionalEvents,
                ...this.events,
            };

            this.panelsData = {};

            Espo.loader.require('res!client/css/misc/layout-manager-grid.css', styleCss => {
                this.$style = $('<style>').html(styleCss).appendTo($('body'));
            });
        },

        onRemove: function () {
            if (this.$style) this.$style.remove();
        },

        addPanel: function () {
            this.lastPanelNumber ++;

            const number = this.lastPanelNumber;

            const data = {
                customLabel: null,
                rows: [[]],
                number: number,
            };

            this.panels.push(data);

            const attributes = {};

            for (const attribute in this.panelDataAttributesDefs) {
                const item = this.panelDataAttributesDefs[attribute];

                if ('default' in item) {
                    attributes[attribute] = item.default;
                }
            }

            this.panelsData[number.toString()] = attributes;

            const $li = $('<li class="panel-layout"></li>');

            $li.attr('data-number', number);

            this.$el.find('ul.panels').append($li);

            this.createPanelView(data, true, (view) => {
                view.render();
            });
        },

        getPanelDataList: function () {
            const panelDataList = [];

            this.panels.forEach((item) => {
                const o = {};

                o.viewKey = 'panel-' + item.number;
                o.number = item.number;

                panelDataList.push(o);
            });

            return panelDataList;
        },

        prepareLayout: function () {
            return new Promise(resolve => {
                let countLoaded = 0;

                this.setupPanels(() => {
                    countLoaded ++;

                    if (countLoaded === this.panels.length) {
                        resolve();
                    }
                });
            });
        },

        setupPanels: function (callback) {
            this.lastPanelNumber = -1;

            this.panels = Espo.Utils.cloneDeep(this.panels);

            this.panels.forEach((panel, i) => {
                panel.number = i;
                this.lastPanelNumber ++;
                this.createPanelView(panel, false, callback);
                this.panelsData[i.toString()] = panel;
            });
        },

        createPanelView: function (data, empty, callback) {
            data.label = data.label || '';

            data.isCustomLabel = false;

            if (data.customLabel) {
                data.labelTranslated = data.customLabel;
                data.isCustomLabel = true;
            } else {
                data.labelTranslated = this.translate(data.label, 'labels', this.scope);
            }

            data.style = data.style || null;

            data.rows.forEach(row => {
                const rest = this.columnCount - row.length;

                if (empty) {
                    for (let i = 0; i < rest; i++) {
                        row.push(false);
                    }
                }

                for (const i in row) {
                    if (row[i] !== false) {
                        row[i].label = this.getLanguage().translate(row[i].name, 'fields', this.scope);

                        if ('customLabel' in row[i]) {
                            row[i].hasCustomLabel = true;
                        }
                    }
                }
            });

            this.createView('panel-' + data.number, 'view', {
                selector: 'li.panel-layout[data-number="'+data.number+'"]',
                template: 'admin/layouts/grid-panel',
                data: () => {
                    const o = Espo.Utils.clone(data);

                    o.dataAttributeList = [];

                    this.panelDataAttributeList.forEach((item) => {
                        if (item === 'panelName') {
                            return;
                        }

                        o.dataAttributeList.push(item);
                    });

                    return o;
                }
            }, callback);
        },

        makeDraggable: function () {
            const self = this;

            const $panels = $('#layout ul.panels');
            const $rows = $('#layout ul.rows');

            $panels.sortable({
                distance: 4,
                update: () => {
                    this.setIsChanged();
                },
            });

            $panels.disableSelection();

            $rows.sortable({
                distance: 4,
                connectWith: '.rows',
                update: () => {
                    this.setIsChanged();
                },
            });
            $rows.disableSelection();

            const $li = $('#layout ul.cells > li');

            $li.draggable({revert: 'invalid', revertDuration: 200, zIndex: 10})
                .css('cursor', 'pointer');

            $li.droppable().droppable('destroy');

            $('#layout ul.cells:not(.disabled) > li').droppable({
                accept: '.cell',
                zIndex: 10,
                hoverClass: 'ui-state-hover',
                drop: function (e, ui) {
                    const index = ui.draggable.index();
                    const parent = ui.draggable.parent();

                    if (parent.get(0) === $(this).parent().get(0)) {
                        if ($(this).index() < ui.draggable.index()) {
                            $(this).before(ui.draggable);
                        } else {
                            $(this).after(ui.draggable);
                        }
                    } else {
                        ui.draggable.insertAfter($(this));

                        if (index === 0) {
                            $(this).prependTo(parent);
                        } else {
                            $(this).insertAfter(parent.children(':nth-child(' + (index) + ')'));
                        }
                    }

                    ui.draggable.css({
                        top: 0,
                        left: 0,
                    });

                    if ($(this).parent().hasClass('disabled') && !$(this).data('name')) {
                        $(this).remove();
                    }

                    self.makeDraggable();

                    self.setIsChanged();
                }
            });
        },

        afterRender: function () {
            this.makeDraggable();

            const wellElement = /** @type {HTMLElement} */this.$el.find('.enabled-well').get(0);

            wellElement.focus({preventScroll: true});
        },

        fetch: function () {
            const layout = [];

            $("#layout ul.panels > li").each((i, el) => {
                const $label = $(el).find('header label');

                const id = $(el).data('number').toString();

                const o = {
                    rows: []
                };

                this.panelDataAttributeList.forEach((item) => {
                    if (item === 'panelName') {
                        return;
                    }

                    o[item] = this.panelsData[id][item];
                });

                o.style = o.style || 'default';

                const name = $(el).find('header').data('name');

                if (name) {
                    o.name = name;
                }

                if ($label.attr('data-is-custom')) {
                    o.customLabel = $label.text();
                } else {
                    o.label = $label.data('label');
                }

                $(el).find('ul.rows > li').each((i, li) => {
                    const row = [];

                    $(li).find('ul.cells > li').each((i, li) => {
                        let cell = false;

                        if (!$(li).hasClass('empty')) {
                            cell = {};

                            this.dataAttributeList.forEach(attr => {
                                const defs = this.dataAttributesDefs[attr] || {};

                                if (defs.notStorable) {
                                    return;
                                }

                                if (attr === 'customLabel') {
                                    if ($(li).get(0).hasAttribute('data-custom-label')) {
                                        cell[attr] = $(li).attr('data-custom-label');
                                    }

                                    return;
                                }

                                const value = $(li).data(Espo.Utils.toDom(attr)) || null;

                                if (value) {
                                    cell[attr] = value;
                                }
                            });
                        }

                        row.push(cell);
                    });

                    o.rows.push(row);
                });

                layout.push(o);
            });

            return layout;
        },

        validate: function (layout) {
            let fieldCount = 0;

            layout.forEach(panel => {
                panel.rows.forEach(row => {
                    row.forEach(cell => {
                        if (cell !== false && cell !== null) {
                            fieldCount++;
                        }
                    });
                });
            });

            if (fieldCount === 0) {
                Espo.Ui.error(
                    this.translate('cantBeEmpty', 'messages', 'LayoutManager')
                );

                return false;
            }

            return true;
        },
    });
});

define("views/admin/layouts/default-page", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
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

  class LayoutDefaultPageView extends _view.default {
    // language=Handlebars
    templateContent = `
        <div class="margin-bottom">{{translate 'selectLayout' category='messages' scope='Admin'}}</div>
        <div class="button-container">
            <button data-action="createLayout" class="btn btn-link">{{translate 'Create'}}</button>
        </div>
    `;
  }
  var _default = LayoutDefaultPageView;
  _exports.default = _default;
});

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

define('views/admin/layouts/bottom-panels-detail', ['views/admin/layouts/side-panels-detail'], function (Dep) {

    return Dep.extend({

        hasStream: true,

        hasRelationships: true,

        TAB_BREAK_KEY: '_tabBreak_{n}',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.on('update-item', (name, attributes) => {


                if (this.isTabName(name)) {
                    let $li = $("#layout ul > li[data-name='" + name + "']");

                    $li.find('.left > span')
                        .text(this.composeTabBreakLabel(attributes));
                }
            });
        },

        composeTabBreakLabel: function (item) {
            let label = '. . . ' + this.translate('tabBreak', 'fields', 'LayoutManager');

            if (item.tabLabel) {
                label += ' : ' + item.tabLabel;
            }

            return label;
        },

        readDataFromLayout: function (layout) {
            let panelListAll = [];
            let labels = {};
            let params = {};

            layout = Espo.Utils.cloneDeep(layout);

            if (
                this.hasStream &&
                this.getMetadata().get(['scopes', this.scope, 'stream'])
            ) {
                panelListAll.push('stream');

                labels['stream'] = this.translate('Stream');

                params['stream'] = {
                    name: 'stream',
                    sticked: true,
                    index: 2,
                };
            }

            (this.getMetadata()
                .get(['clientDefs', this.scope, 'bottomPanels', this.viewType]) || []
            ).forEach(item => {
                if (!item.name) {
                    return;
                }

                panelListAll.push(item.name);

                if (item.label) {
                    labels[item.name] = item.label;
                }

                params[item.name] = Espo.Utils.clone(item);

                if ('order' in item) {
                    params[item.name].index = item.order;
                }
            });

            for (let name in layout) {
                let item = layout[name];

                if (item.tabBreak) {
                    panelListAll.push(name);

                    labels[name] = this.composeTabBreakLabel(item);

                    params[name] = {
                        name: item.name,
                        index: item.index,
                        tabBreak: true,
                        tabLabel: item.tabLabel || null,
                    };
                }
            }

            this.links = {};

            if (this.hasRelationships) {
                var linkDefs = this.getMetadata().get(['entityDefs', this.scope, 'links']) || {};

                Object.keys(linkDefs).forEach(link => {
                    if (
                        linkDefs[link].disabled ||
                        linkDefs[link].utility ||
                        linkDefs[link].layoutRelationshipsDisabled
                    ) {
                        return;
                    }

                    if (!~['hasMany', 'hasChildren'].indexOf(linkDefs[link].type)) {
                        return;
                    }

                    panelListAll.push(link);

                    labels[link] = this.translate(link, 'links', this.scope);

                    var item = {
                        name: link,
                        index: 5,
                    };

                    this.dataAttributeList.forEach(attribute => {
                        if (attribute in item) {
                            return;
                        }

                        var value = this.getMetadata()
                            .get(['clientDefs', this.scope, 'relationshipPanels', item.name, attribute]);

                        if (value === null) {
                            return;
                        }

                        item[attribute] = value;
                    });

                    this.links[link] = true;

                    params[item.name] = item;
                });
            }

            this.disabledFields = [];

            layout = layout || {};

            this.rowLayout = [];

            panelListAll = panelListAll.sort((v1, v2) => {
                return params[v1].index - params[v2].index
            });

            panelListAll.push('_delimiter_');

            if (!layout['_delimiter_']) {
                layout['_delimiter_'] = {
                    disabled: true,
                };
            }

            labels[this.TAB_BREAK_KEY] = '. . . ' + this.translate('tabBreak', 'fields', 'LayoutManager');

            panelListAll.push(this.TAB_BREAK_KEY);

            panelListAll.forEach((item, index) => {
                var disabled = false;
                var itemData = layout[item] || {};

                if (itemData.disabled) {
                    disabled = true;
                }

                if (!layout[item]) {
                    if ((params[item] || {}).disabled) {
                        disabled = true;
                    }
                }

                if (this.links[item]) {
                    if (!layout[item]) {
                        disabled = true;
                    }
                }

                if (item === this.TAB_BREAK_KEY) {
                    disabled = true;
                }

                var labelText;

                if (labels[item]) {
                    labelText = this.getLanguage().translate(labels[item], 'labels', this.scope);
                } else {
                    labelText = this.getLanguage().translate(item, 'panels', this.scope);
                }

                if (disabled) {
                    let o = {
                        name: item,
                        label: labelText,
                    };

                    if (o.name[0] === '_') {
                        if (o.name === '_delimiter_') {
                            o.notEditable = true;
                            o.label = '. . .';
                        }
                    }

                    this.disabledFields.push(o);

                    return;
                }

                var o = {
                    name: item,
                    label: labelText,
                };

                if (o.name[0] === '_') {
                    if (o.name === '_delimiter_') {
                        o.notEditable = true;
                        o.label = '. . .';
                    }
                }

                if (o.name in params) {
                    this.dataAttributeList.forEach(attribute => {
                        if (attribute === 'name') {
                            return;
                        }

                        var itemParams = params[o.name] || {};

                        if (attribute in itemParams) {
                            o[attribute] = itemParams[attribute];
                        }
                    });
                }

                for (var i in itemData) {
                    o[i] = itemData[i];
                }

                o.index = ('index' in itemData) ? itemData.index : index;

                this.rowLayout.push(o);

                this.itemsData[o.name] = Espo.Utils.cloneDeep(o);
            });

            this.rowLayout.sort((v1, v2) => {
                return (v1.index || 0) - (v2.index || 0);
            });
        },

        onDrop: function () {
            let tabBreakIndex = -1;

            let $tabBreak = null;

            this.$el.find('ul.enabled').children().each((i, li) => {
                let $li = $(li);
                let name = $li.attr('data-name');

                if (this.isTabName(name)) {
                    if (name !== this.TAB_BREAK_KEY) {
                        let itemIndex = parseInt(name.split('_')[2]);

                        if (itemIndex > tabBreakIndex) {
                            tabBreakIndex = itemIndex;
                        }
                    }
                }
            });

            tabBreakIndex++;

            this.$el.find('ul.enabled').children().each((i, li) => {
                let $li = $(li);
                let name = $li.attr('data-name');

                if (this.isTabName(name) && name === this.TAB_BREAK_KEY) {
                    $tabBreak = $li.clone();

                    let realName = this.TAB_BREAK_KEY.slice(0, -3) + tabBreakIndex;

                    $li.attr('data-name', realName);

                    delete this.itemsData[realName];
                }
            });

            if (!$tabBreak) {
                this.$el.find('ul.disabled').children().each((i, li) => {
                    let $li = $(li);

                    let name = $li.attr('data-name');

                    if (this.isTabName(name) && name !== this.TAB_BREAK_KEY) {
                        $li.remove();
                    }
                });
            }

            if ($tabBreak) {
                $tabBreak.appendTo(this.$el.find('ul.disabled'));
            }
        },

        isTabName: function (name) {
            return name.substring(0, this.TAB_BREAK_KEY.length - 3) === this.TAB_BREAK_KEY.slice(0, -3);
        },

        getEditAttributesModalViewOptions: function (attributes) {
            let options = Dep.prototype.getEditAttributesModalViewOptions.call(this, attributes);

            if (this.isTabName(attributes.name)) {
                options.attributeList = [
                    'tabLabel',
                ];

                options.attributeDefs = {
                    tabLabel: {
                        type: 'varchar',
                    },
                };
            }

            return options;
        },

        fetch: function () {
            let layout = Dep.prototype.fetch.call(this);

            let newLayout = {};


            for (let name in layout) {
                if (layout[name].disabled && this.links[name]) {
                    continue;
                }

                newLayout[name] = layout[name];

                if (this.isTabName(name) && name !== this.TAB_BREAK_KEY /*&& this.itemsData[name]*/) {
                    let data = this.itemsData[name] || {};

                    newLayout[name].tabBreak = true;
                    newLayout[name].tabLabel = data.tabLabel;
                }
                else {
                   delete newLayout[name].tabBreak;
                   delete newLayout[name].tabLabel;
                }
            }

            delete newLayout[this.TAB_BREAK_KEY];

            return newLayout;
        },
    });
});

define("views/admin/layouts/modals/create", ["exports", "views/modal", "views/record/edit-for-modal", "model", "views/fields/enum", "views/fields/varchar"], function (_exports, _modal, _editForModal, _model, _enum, _varchar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _modal = _interopRequireDefault(_modal);
  _editForModal = _interopRequireDefault(_editForModal);
  _model = _interopRequireDefault(_model);
  _enum = _interopRequireDefault(_enum);
  _varchar = _interopRequireDefault(_varchar);
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

  /** @module views/admin/layouts/modals/create */

  class LayoutCreateModalView extends _modal.default {
    // language=Handlebars
    templateContent = `
        <div class="complex-text-container">{{complexText info}}</div>
        <div class="record no-side-margin">{{{record}}}</div>
    `;
    className = 'dialog dialog-record';

    /**
     * @typedef {Object} module:views/admin/layouts/modals/create~data
     * @property {string} type
     * @property {string} name
     * @property {string} label
     */

    /**
     * @param {{scope: string}} options
     */
    constructor(options) {
      super();
      this.scope = options.scope;
    }
    data() {
      return {
        info: this.translate('createInfo', 'messages', 'LayoutManager')
      };
    }
    setup() {
      this.headerText = this.translate('Create');
      this.buttonList = [{
        name: 'create',
        style: 'danger',
        label: 'Create',
        onClick: () => this.actionCreate()
      }, {
        name: 'cancel',
        label: 'Cancel'
      }];
      this.model = new _model.default({
        type: 'list',
        name: 'listForMyEntityType',
        label: 'List (for MyEntityType)'
      });
      this.recordView = new _editForModal.default({
        model: this.model,
        detailLayout: [{
          columns: [[{
            view: new _enum.default({
              name: 'type',
              params: {
                readOnly: true,
                translation: 'Admin.layouts',
                options: ['list']
              },
              labelText: this.translate('type', 'fields', 'Admin')
            })
          }, {
            view: new _varchar.default({
              name: 'name',
              params: {
                required: true,
                noSpellCheck: true,
                pattern: '$latinLetters'
              },
              labelText: this.translate('name', 'fields')
            })
          }, {
            view: new _varchar.default({
              name: 'label',
              params: {
                required: true,
                pattern: '$noBadCharacters'
              },
              labelText: this.translate('label', 'fields', 'Admin')
            })
          }], []]
        }]
      });
      this.assignView('record', this.recordView, '.record');
    }
    actionCreate() {
      this.recordView.fetch();
      if (this.recordView.validate()) {
        return;
      }
      this.disableButton('create');
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('Layout/action/create', {
        scope: this.scope,
        type: this.model.get('type'),
        name: this.model.get('name'),
        label: this.model.get('label')
      }).then(() => {
        this.reRender();
        Espo.Ui.success('Created', {
          suppress: true
        });
        this.trigger('done');
        this.close();
      }).catch(() => {
        this.enableButton('create');
      });
    }
  }
  var _default = LayoutCreateModalView;
  _exports.default = _default;
});

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

define('views/admin/dynamic-logic/conditions-string/item-operator-only-base',
['views/admin/dynamic-logic/conditions-string/item-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-operator-only-base',

        createValueFieldView: function () {},

    });
});

define("views/admin/dynamic-logic/conditions/field-types/base", ["exports", "view", "ui/select"], function (_exports, _view, _select) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _select = _interopRequireDefault(_select);
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

  class _default extends _view.default {
    template = 'admin/dynamic-logic/conditions/field-types/base';
    events = {
      'click > div > div > [data-action="remove"]': function (e) {
        e.stopPropagation();
        this.trigger('remove-item');
      }
    };
    data() {
      return {
        type: this.type,
        field: this.field,
        scope: this.scope,
        typeList: this.typeList,
        leftString: this.translateLeftString()
      };
    }
    translateLeftString() {
      return this.translate(this.field, 'fields', this.scope);
    }
    setup() {
      this.type = this.options.type;
      this.field = this.options.field;
      this.scope = this.options.scope;
      this.fieldType = this.options.fieldType;
      this.itemData = this.options.itemData;
      this.additionalData = this.itemData.data || {};
      this.typeList = this.getMetadata().get(['clientDefs', 'DynamicLogic', 'fieldTypes', this.fieldType, 'typeList']);
      this.wait(true);
      this.createModel().then(model => {
        this.model = model;
        this.populateValues();
        this.manageValue();
        this.wait(false);
      });
    }
    createModel() {
      return this.getModelFactory().create(this.scope);
    }
    afterRender() {
      this.$type = this.$el.find('select[data-name="type"]');
      _select.default.init(this.$type.get(0));
      this.$type.on('change', () => {
        this.type = this.$type.val();
        this.manageValue();
      });
    }
    populateValues() {
      if (this.itemData.attribute) {
        this.model.set(this.itemData.attribute, this.itemData.value);
      }
      this.model.set(this.additionalData.values || {});
    }
    getValueViewName() {
      const fieldType = this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'type']) || 'base';
      return this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'view']) || this.getFieldManager().getViewName(fieldType);
    }
    getValueFieldName() {
      return this.field;
    }
    manageValue() {
      const valueType = this.getMetadata().get(['clientDefs', 'DynamicLogic', 'fieldTypes', this.fieldType, 'conditionTypes', this.type, 'valueType']) || this.getMetadata().get(['clientDefs', 'DynamicLogic', 'conditionTypes', this.type, 'valueType']);
      if (valueType === 'field') {
        const viewName = this.getValueViewName();
        const fieldName = this.getValueFieldName();
        this.createView('value', viewName, {
          model: this.model,
          name: fieldName,
          selector: '.value-container',
          mode: 'edit',
          readOnlyDisabled: true
        }, view => {
          if (this.isRendered()) {
            view.render();
          }
        });
      } else if (valueType === 'custom') {
        this.clearView('value');
        const methodName = 'createValueView' + Espo.Utils.upperCaseFirst(this.type);
        this[methodName]();
      } else if (valueType === 'varchar') {
        this.createView('value', 'views/fields/varchar', {
          model: this.model,
          name: this.getValueFieldName(),
          selector: '.value-container',
          mode: 'edit',
          readOnlyDisabled: true
        }, view => {
          if (this.isRendered()) {
            view.render();
          }
        });
      } else {
        this.clearView('value');
      }
    }
    fetch() {
      const valueView = this.getView('value');
      const item = {
        type: this.type,
        attribute: this.field
      };
      if (valueView) {
        valueView.fetchToModel();
        item.value = this.model.get(this.field);
      }
      return item;
    }
  }
  _exports.default = _default;
});

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

define('views/outbound-email/fields/test-send', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        templateContent:
            '<button class="btn btn-default hidden" data-action="sendTestEmail">'+
            '{{translate \'Send Test Email\' scope=\'Email\'}}</button>',

        events: {
            'click [data-action="sendTestEmail"]': function () {
                this.send();
            },
        },

        fetch: function () {
            return {};
        },

        checkAvailability: function () {
            if (this.model.get('smtpServer')) {
                this.$el.find('button').removeClass('hidden');
            } else {
                this.$el.find('button').addClass('hidden');
            }
        },

        afterRender: function () {
            this.checkAvailability();

            this.stopListening(this.model, 'change:smtpServer');

            this.listenTo(this.model, 'change:smtpServer', () => {
                this.checkAvailability();
            });
        },

        getSmtpData: function () {
            return {
                'server': this.model.get('smtpServer'),
                'port': this.model.get('smtpPort'),
                'auth': this.model.get('smtpAuth'),
                'security': this.model.get('smtpSecurity'),
                'username': this.model.get('smtpUsername'),
                'password': this.model.get('smtpPassword') || null,
                'fromName': this.model.get('outboundEmailFromName'),
                'fromAddress': this.model.get('outboundEmailFromAddress'),
                'type': 'outboundEmail',
            };
        },

        send: function () {
            var data = this.getSmtpData();

            this.createView('popup', 'views/outbound-email/modals/test-send', {
                emailAddress: this.getUser().get('emailAddress')
            }, (view) => {
                view.render();

                this.listenToOnce(view, 'send', (emailAddress) => {
                    this.$el.find('button').addClass('disabled');
                    data.emailAddress = emailAddress;

                    this.notify('Sending...');

                    view.close();

                    Espo.Ajax.postRequest('Email/sendTest', data)
                        .then(() => {
                            this.$el.find('button').removeClass('disabled');

                            Espo.Ui.success(this.translate('testEmailSent', 'messages', 'Email'));
                        })
                        .catch((xhr) => {
                            var reason = xhr.getResponseHeader('X-Status-Reason') || '';

                            reason = reason
                                .replace(/ $/, '')
                                .replace(/,$/, '');

                            var msg = this.translate('Error');

                            if (xhr.status !== 200) {
                                msg += ' ' + xhr.status;
                            }

                            if (xhr.responseText) {
                                try {
                                    var data = JSON.parse(xhr.responseText);

                                    reason = data.message || reason;
                                }
                                catch (e) {
                                    console.error('Could not parse error response body.');

                                    return;
                                }
                            }

                            if (reason) {
                                msg += ': ' + reason;
                            }

                            Espo.Ui.error(msg, true);

                            console.error(msg);

                            xhr.errorIsHandled = true;

                            this.$el.find('button').removeClass('disabled');
                        }
                    );

                });
            });
        },
    });
});

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

define('views/role/record/table', ['view'], function (Dep) {

    return Dep.extend({

        template: 'role/table',

        scopeList: null,

        actionList: ['create', 'read', 'edit', 'delete', 'stream'],

        accessList: ['not-set', 'enabled', 'disabled'],

        fieldLevelList: ['yes', 'no'],

        fieldActionList: ['read', 'edit'],

        levelListMap: {
            'recordAllTeamOwnNo': ['all', 'team', 'own', 'no'],
            'recordAllTeamNo': ['all', 'team', 'no'],
            'recordAllOwnNo': ['all', 'own', 'no'],
            'recordAllNo': ['all', 'no'],
            'record': ['all', 'team', 'own', 'no'],
        },

        type: 'acl',

        levelList: ['yes', 'all', 'team', 'own', 'no'],

        booleanLevelList: ['yes', 'no'],

        booleanActionList: ['create'],

        defaultLevels: {
            delete: 'no',
        },

        colors: {
            yes: '#6BC924',
            all: '#6BC924',
            account: '#999900',
            contact: '#999900',
            team: '#999900',
            own: '#CC9900',
            no: '#F23333',
            enabled: '#6BC924',
            disabled: '#F23333',
            'not-set': '#A8A8A8',
        },

        mode: 'detail',

        tableData: null,

        data: function () {
            var data = {};
            data.editMode = this.mode === 'edit';
            data.actionList = this.actionList;
            data.accessList = this.accessList;
            data.fieldActionList = this.fieldActionList;
            data.fieldLevelList = this.fieldLevelList;
            data.colors = this.colors;

            data.tableDataList = this.getTableDataList();
            data.fieldTableDataList = this.fieldTableDataList;

            var hasFieldLevelData = false;

            this.fieldTableDataList.forEach((d) => {
                if (d.list.length) {
                    hasFieldLevelData = true;
                }
            });

            data.hasFieldLevelData = hasFieldLevelData;

            return data;
        },

        events: {
            'click .action[data-action="addField"]': function (e) {
                var scope = $(e.currentTarget).data().scope;

                this.showAddFieldModal(scope);
            },
            'click .action[data-action="removeField"]': function (e) {
                var scope = $(e.currentTarget).data().scope;
                var field = $(e.currentTarget).data().field;

                this.removeField(scope, field);
            },
            'change select[data-type="access"]': function (e) {
                var scope = $(e.currentTarget).attr('name');
                var $dropdowns = this.$el.find('select[data-scope="' + scope + '"]');

                if ($(e.currentTarget).val() === 'enabled') {
                    $dropdowns.removeAttr('disabled');
                    $dropdowns.removeClass('hidden');

                    $dropdowns.each((i, select) => {
                        let $select = $(select);

                        if (this.lowestLevelByDefault) {
                            $select.find('option').last().prop('selected', true);
                        } else {
                            var setFirst = true;
                            var action = $select.data('role-action');
                            var defaultLevel = null;

                            if (action) {
                                defaultLevel = this.defaultLevels[action];
                            }

                            if (defaultLevel) {
                                var $option = $select.find('option[value="'+defaultLevel+'"]');
                                if ($option.length) {
                                    $option.prop('selected', true);
                                    setFirst = false;
                                }
                            }

                            if (setFirst) {
                                $select.find('option').first().prop('selected', true);
                            }
                        }

                        $select.trigger('change');

                        this.controlSelectColor($select);
                    });
                } else {
                    $dropdowns.attr('disabled', 'disabled');
                    $dropdowns.addClass('hidden');
                }

                this.controlSelectColor($(e.currentTarget));
            },
            'change select.scope-action': function (e) {
                this.controlSelectColor($(e.currentTarget));
            },
            'change select.field-action': function (e) {
                this.controlSelectColor($(e.currentTarget));
            },
        },

        getTableDataList: function () {
            var aclData = this.acl.data;
            var aclDataList = [];

            this.scopeList.forEach(scope => {

                var access = 'not-set';

                if (this.final) {
                    access = 'enabled';
                }

                if (scope in aclData) {
                    if (aclData[scope] === false) {
                        access = 'disabled';
                    } else {
                        access = 'enabled';
                    }
                }

                var list = [];
                var type = this.aclTypeMap[scope];

                if (this.aclTypeMap[scope] !== 'boolean') {
                    this.actionList.forEach(action => {
                        var allowedActionList = this.getMetadata().get(['scopes', scope, this.type + 'ActionList']);

                        if (allowedActionList) {
                            if (!~allowedActionList.indexOf(action)) {
                                list.push({
                                    action: action,
                                    levelList: false,
                                    level: null,
                                });

                                return;
                            }
                        }

                        if (action === 'stream') {
                            if (!this.getMetadata().get('scopes.' + scope + '.stream')) {
                                list.push({
                                    action: 'stream',
                                    levelList: false,
                                    level: null,
                                });

                                return;
                            }
                        }

                        var level = 'no';

                        if (~this.booleanActionList.indexOf(action)) {
                            level = 'no';
                        }

                        if (scope in aclData) {
                            if (access === 'enabled') {
                                if (aclData[scope] !== true) {
                                    if (action in aclData[scope]) {
                                        level = aclData[scope][action];
                                    }
                                }
                            } else {
                                level = 'no';
                            }
                        }

                        var levelList =
                            this.getMetadata().get(['scopes', scope, this.type + 'ActionLevelListMap', action]) ||
                            this.getMetadata().get(['scopes', scope, this.type + 'LevelList']) ||
                            this.levelListMap[type] ||
                            [];

                        if (~this.booleanActionList.indexOf(action)) {
                            levelList = this.booleanLevelList;
                        }

                        list.push({
                            level: level,
                            name: scope + '-' + action,
                            action: action,
                            levelList: levelList,
                        });
                    });
                }

                aclDataList.push({
                    list: list,
                    access: access,
                    name: scope,
                    type: type,
                });
            });

            return aclDataList;
        },

        setup: function () {
            this.mode = this.options.mode || 'detail';

            this.final = this.options.final || false;

            this.setupData();

            this.listenTo(this.model, 'change', () => {
                if (this.model.hasChanged('data') || this.model.hasChanged('fieldData')) {
                    this.setupData();
                }
            });

            this.listenTo(this.model, 'sync', () => {
                this.setupData();

                if (this.isRendered()) {
                    this.reRender();
                }
            });

            this.template = 'role/table';

            if (this.mode === 'edit') {
                this.template = 'role/table-edit';
            }

            this.once('remove', () => {
                $(window).off('scroll.scope-' + this.cid);
                $(window).off('resize.scope-' + this.cid);
                $(window).off('scroll.field-' + this.cid);
                $(window).off('resize.field-' + this.cid);
            });
        },

        setupData: function () {
            this.acl = {};

            if (this.options.acl) {
                this.acl.data = this.options.acl.data;
            } else {
                this.acl.data = Espo.Utils.cloneDeep(this.model.get('data') || {});
            }

            if (this.options.acl) {
                this.acl.fieldData = this.options.acl.fieldData;
            } else {
                this.acl.fieldData = Espo.Utils.cloneDeep(this.model.get('fieldData') || {});
            }

            this.setupScopeList();
            this.setupFieldTableDataList();
        },

        setupScopeList: function () {
            this.aclTypeMap = {};
            this.scopeList = [];

            var scopeListAll = Object.keys(this.getMetadata().get('scopes'))
                .sort((v1, v2) => {
                     return this.translate(v1, 'scopeNamesPlural')
                         .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            scopeListAll.forEach(scope => {
                if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
                    return;
                }

                var acl = this.getMetadata().get('scopes.' + scope + '.acl');

                if (acl) {
                    this.scopeList.push(scope);
                    this.aclTypeMap[scope] = acl;

                    if (acl === true) {
                        this.aclTypeMap[scope] = 'record';
                    }
                }
            });
        },

        setupFieldTableDataList: function () {
            this.fieldTableDataList = [];

            this.scopeList.forEach(scope => {
                var d = this.getMetadata().get('scopes.' + scope) || {};

                if (!d.entity) {
                    return;
                }

                if (!(scope in this.acl.fieldData)) {
                    if (this.mode === 'edit') {
                        this.fieldTableDataList.push({
                            name: scope,
                            list: [],
                        });

                        return;
                    }

                    return;
                }

                var scopeData = this.acl.fieldData[scope];
                var fieldList = this.getFieldManager().getEntityTypeFieldList(scope);

                this.getLanguage().sortFieldList(scope, fieldList);

                var fieldDataList = [];

                fieldList.forEach(field => {
                    if (!(field in scopeData)) {
                        return;
                    }

                    var list = [];

                    this.fieldActionList.forEach(action => {
                        list.push({
                            name: action,
                            value: scopeData[field][action] || 'yes',
                        })
                    });

                    if (this.mode === 'detail') {
                        if (!list.length) {
                            return;
                        }
                    }

                    fieldDataList.push({
                        name: field,
                        list: list
                    });
                });

                this.fieldTableDataList.push({
                    name: scope,
                    list: fieldDataList,
                });
            });
        },

        fetchScopeData: function () {
            var data = {};

            var scopeList = this.scopeList;
            var actionList = this.actionList;
            var aclTypeMap = this.aclTypeMap;

            for (var i in scopeList) {
                var scope = scopeList[i];

                if (this.$el.find('select[name="' + scope + '"]').val() === 'not-set') {
                    continue;
                }

                if (this.$el.find('select[name="' + scope + '"]').val() === 'disabled') {
                    data[scope] = false;
                } else {
                    var o = true;

                    if (aclTypeMap[scope] !== 'boolean') {
                        o = {};

                        for (var j in actionList) {
                            var action = actionList[j];

                            o[action] = this.$el.find('select[name="' + scope + '-' + action + '"]').val();
                        }
                    }

                    data[scope] = o;
                }
            }

            return data;
        },

        fetchFieldData: function () {
            var data = {};

            this.fieldTableDataList.forEach(scopeData => {
                var scopeObj = {};
                var scope = scopeData.name;

                scopeData.list.forEach(fieldData => {
                    var field = fieldData.name;
                    var fieldObj = {};

                    this.fieldActionList.forEach(action =>{
                        var $select = this.$el
                            .find('select[data-scope="'+scope+'"][data-field="'+field+'"][data-action="'+action+'"]');

                        if (!$select.length) {
                            return;
                        }

                        fieldObj[action] = $select.val();
                    });

                    scopeObj[field] = fieldObj;
                });

                data[scope] = scopeObj;
            });

            return data;
        },

        afterRender: function () {
            if (this.mode === 'edit') {
                this.scopeList.forEach(scope => {
                    var $read = this.$el.find('select[name="'+scope+'-read"]');

                    $read.on('change', () => {
                        var value = $read.val();

                        this.controlEditSelect(scope, value);
                        this.controlDeleteSelect(scope, value);
                        this.controlStreamSelect(scope, value);
                    });

                    var $edit = this.$el.find('select[name="'+scope+'-edit"]');

                    $edit.on('change', () => {
                        var value = $edit.val();

                        this.controlDeleteSelect(scope, value);
                    });

                    this.controlEditSelect(scope, $read.val(), true);
                    this.controlStreamSelect(scope, $read.val(), true);
                    this.controlDeleteSelect(scope, $edit.val(), true);
                });

                this.fieldTableDataList.forEach(o => {
                    var scope = o.name;

                    o.list.forEach(f => {
                        var field = f.name;

                        var $read = this.$el
                            .find('select[data-scope="'+scope+'"][data-field="'+field+'"][data-action="read"]');

                        $read.on('change', () => {
                            var value = $read.val();

                            this.controlFieldEditSelect(scope, field, value);
                        });

                        this.controlFieldEditSelect(scope, field, $read.val(), true);
                    });
                });

                this.setSelectColors();
            }

            if (this.mode === 'edit' || this.mode === 'detail') {
                this.initStickyHeader('scope');
                this.initStickyHeader('field');
            }
        },

        controlFieldEditSelect: function (scope, field, value, dontChange) {
            var $edit = this.$el.find('select[data-scope="'+scope+'"][data-field="'+field+'"][data-action="edit"]');

            if (!dontChange) {
                if (this.fieldLevelList.indexOf($edit.val()) < this.fieldLevelList.indexOf(value)) {
                    $edit.val(value);
                }
            }

            $edit.find('option').each((i, o) => {
                var $o = $(o);

                if (this.fieldLevelList.indexOf($o.val()) < this.fieldLevelList.indexOf(value)) {
                    $o.attr('disabled', 'disabled');
                } else {
                    $o.removeAttr('disabled');
                }
            });

            this.controlSelectColor($edit);
        },

        controlEditSelect: function (scope, value, dontChange) {
            var $edit = this.$el.find('select[name="'+scope+'-edit"]');

            if (!dontChange) {
                if (this.levelList.indexOf($edit.val()) < this.levelList.indexOf(value)) {
                    $edit.val(value);
                }
            }

            $edit.find('option').each((i, o) => {
                var $o = $(o);

                if (this.levelList.indexOf($o.val()) < this.levelList.indexOf(value)) {
                    $o.attr('disabled', 'disabled');
                } else {
                    $o.removeAttr('disabled');
                }
            });

            this.controlSelectColor($edit);
        },

        controlStreamSelect: function (scope, value, dontChange) {
            var $stream = this.$el.find('select[name="'+scope+'-stream"]');

            if (!dontChange) {
                if (this.levelList.indexOf($stream.val()) < this.levelList.indexOf(value)) {
                    $stream.val(value);
                }
            }

            $stream.find('option').each((i, o) => {
                var $o = $(o);

                if (this.levelList.indexOf($o.val()) < this.levelList.indexOf(value)) {
                    $o.attr('disabled', 'disabled');
                } else {
                    $o.removeAttr('disabled');
                }
            });

            this.controlSelectColor($stream);
        },

        controlDeleteSelect: function (scope, value, dontChange) {
            var $delete = this.$el.find('select[name="'+scope+'-delete"]');

            if (!dontChange) {
                if (this.levelList.indexOf($delete.val()) < this.levelList.indexOf(value)) {
                    $delete.val(value);
                }
            }

            $delete.find('option').each((i, o) => {
                var $o = $(o);

                if (this.levelList.indexOf($o.val()) < this.levelList.indexOf(value)) {
                    $o.attr('disabled', 'disabled');
                } else {
                    $o.removeAttr('disabled');
                }
            });

            this.controlSelectColor($delete);
        },

        showAddFieldModal: function (scope) {
            this.trigger('change');

            var ignoreFieldList = Object.keys(this.acl.fieldData[scope] || {});

            this.createView('addField', 'views/role/modals/add-field', {
                scope: scope,
                ignoreFieldList: ignoreFieldList,
                type: this.type,
            }, (view) => {
                view.render();

                this.listenTo(view, 'add-field', field => {
                    view.close();

                    this.fieldTableDataList.forEach(scopeData =>{
                        if (scopeData.name !== scope) {
                            return;
                        }

                        var found = false;

                        scopeData.list.forEach(d => {
                            if (d.name === field) {
                                found = true;
                            }
                        });

                        if (found) {
                            return;
                        }

                        scopeData.list.unshift({
                            name: field,
                            list: [
                                {
                                    name: 'read',
                                    value: 'yes'
                                },
                                {
                                    name: 'edit',
                                    value: 'yes'
                                }
                            ]
                        });
                    });

                    this.reRender();
                });
            });
        },

        removeField: function (scope, field) {
            this.trigger('change');

            this.fieldTableDataList.forEach(scopeData => {
                if (scopeData.name !== scope) {
                    return;
                }

                var index = -1;

                scopeData.list.forEach((d, i) => {
                    if (d.name === field) {
                        index = i;
                    }
                });

                if (~index) {
                    scopeData.list.splice(index, 1);

                    this.reRender();
                }
            });
        },

        initStickyHeader: function (type) {
            var $sticky = this.$el.find('.sticky-header-' + type);
            var $window = $(window);

            var screenWidthXs = this.getThemeManager().getParam('screenWidthXs');

            var $buttonContainer = $('.detail-button-container');
            var $table = this.$el.find('table.' + type + '-level');

            if (!$table.length) {
                return;
            }

            if (!$buttonContainer.length) {
                return;
            }

            var handle = () => {
                if ($(window.document).width() < screenWidthXs) {
                    $sticky.addClass('hidden');

                    return;
                }

                let stickTopPosition = $buttonContainer.get(0).getBoundingClientRect().top +
                    $buttonContainer.outerHeight();

                let topEdge = $table.position().top;

                topEdge -= $buttonContainer.height();
                topEdge += $table.find('tr > th').height();
                topEdge -= this.getThemeManager().getParam('navbarHeight');

                let bottomEdge = topEdge + $table.outerHeight(true) - $buttonContainer.height();
                let scrollTop = $window.scrollTop();
                let width = $table.width();

                if (scrollTop > topEdge && scrollTop < bottomEdge) {
                    $sticky.css({
                        position: 'fixed',
                        marginTop: stickTopPosition + 'px',
                        top: 0,
                        width: width + 'px',
                        marginLeft: '1px',
                    });

                    $sticky.removeClass('hidden');
                } else {
                    $sticky.addClass('hidden');
                }
            };

            $window.off('scroll.' + type + '-' + this.cid);
            $window.on('scroll.' + type + '-' + this.cid, handle);

            $window.off('resize.' + type + '-' + this.cid);
            $window.on('resize.' + type + '-' + this.cid, handle);
        },

        setSelectColors: function () {
            this.$el.find('select[data-type="access"]').each((i, el) => {
                var $select = $(el);
                this.controlSelectColor($select);
            });

            this.$el.find('select.scope-action').each((i, el) => {
                var $select = $(el);
                this.controlSelectColor($select);
            });

            this.$el.find('select.field-action').each((i, el) => {
                var $select = $(el);
                this.controlSelectColor($select);
            });
        },

        controlSelectColor: function ($select) {
            var level = $select.val();
            var color = this.colors[level] || '';

            if (level === 'not-set') {
                color = '';
            }

            $select.css('color', color);

            $select.children().each((j, el) => {
                var $o = $(el);
                var level = $o.val();

                var color = this.colors[level] || '';

                if (level === 'not-set') {
                    color = '';
                }

                if ($o.attr('disabled')) {
                    color = '';
                }

                $o.css('color', color);
            });
        },
    });
});

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

define('views/role/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

    	quickDetailDisabled: true,

        quickEditDisabled: true,

        massActionList: ['remove', 'export'],

        checkAllResultDisabled: true

    });
});

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

define('views/role/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        tableView: 'views/role/record/table',

        sideView: false,

        isWide: true,

        stickButtonsContainerAllTheWay: true,

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            data['data'] = {};

            var scopeList = this.getView('extra').scopeList;
            var actionList = this.getView('extra').actionList;
            var aclTypeMap = this.getView('extra').aclTypeMap;

            for (var i in scopeList) {
                var scope = scopeList[i];

                if (this.$el.find('select[name="' + scope + '"]').val() === 'not-set') {
                    continue;
                }

                if (this.$el.find('select[name="' + scope + '"]').val() === 'disabled') {
                    data['data'][scope] = false;
                } else {
                    var o = true;

                    if (aclTypeMap[scope] !== 'boolean') {
                        o = {};

                        for (var j in actionList) {
                            var action = actionList[j];
                            o[action] = this.$el.find('select[name="' + scope + '-' + action + '"]').val();
                        }
                    }

                    data['data'][scope] = o;
                }
            }

            data['data'] = this.getView('extra').fetchScopeData();
            data['fieldData'] = this.getView('extra').fetchFieldData();

            return data;
        },

        getDetailLayout: function (callback) {
            var simpleLayout = [
                {
                    label: '',
                    cells: [
                        {
                            name: 'name',
                            type: 'varchar',
                        },
                    ]
                }
            ];
            callback({
                type: 'record',
                layout: this._convertSimplifiedLayout(simpleLayout)
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createView('extra', this.tableView, {
                mode: 'edit',
                selector: '.extra',
                model: this.model,
            }, view => {
                this.listenTo(view, 'change', () => {
                    var data = this.fetch();
                    this.model.set(data);
                });
            });
        },
    });
});

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

define('views/role/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        tableView: 'views/role/record/table',

        sideView: false,
        isWide: true,
        editModeDisabled: true,
        stickButtonsContainerAllTheWay: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createView('extra', this.tableView, {
                selector: '.extra',
                model: this.model
            });
        },
    });
});

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

define('views/inbound-email/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupFieldsBehaviour();
            this.initSslFieldListening();
        },

        modifyDetailLayout: function (layout) {
            layout.filter(panel => panel.tabLabel === '$label:SMTP').forEach(panel => {
                panel.rows.forEach(row => {
                    row.forEach(item => {
                        let labelText = this.translate(item.name, 'fields', 'InboundEmail');

                        if (labelText && labelText.indexOf('SMTP ') === 0) {
                            item.labelText = Espo.Utils.upperCaseFirst(labelText.substring(5));
                        }
                    });
                })
            });
        },

        wasFetched: function () {
            if (!this.model.isNew()) {
                return !!((this.model.get('fetchData') || {}).lastUID);
            }

            return false;
        },

        initSmtpFieldsControl: function () {
            this.controlSmtpFields();
            this.controlSentFolderField();
            this.listenTo(this.model, 'change:useSmtp', this.controlSmtpFields, this);
            this.listenTo(this.model, 'change:smtpAuth', this.controlSmtpFields, this);
            this.listenTo(this.model, 'change:storeSentEmails', this.controlSentFolderField, this);
        },

        controlSmtpFields: function () {
            if (this.model.get('useSmtp')) {
                this.showField('smtpHost');
                this.showField('smtpPort');
                this.showField('smtpAuth');
                this.showField('smtpSecurity');
                this.showField('smtpTestSend');
                this.showField('fromName');
                this.showField('smtpIsShared');
                this.showField('smtpIsForMassEmail');
                this.showField('storeSentEmails');

                this.setFieldRequired('smtpHost');
                this.setFieldRequired('smtpPort');

                this.controlSmtpAuthField();

                return;
            }

            this.hideField('smtpHost');
            this.hideField('smtpPort');
            this.hideField('smtpAuth');
            this.hideField('smtpUsername');
            this.hideField('smtpPassword');
            this.hideField('smtpAuthMechanism');
            this.hideField('smtpSecurity');
            this.hideField('smtpTestSend');
            this.hideField('fromName');
            this.hideField('smtpIsShared');
            this.hideField('smtpIsForMassEmail');
            this.hideField('storeSentEmails');
            this.hideField('sentFolder');

            this.setFieldNotRequired('smtpHost');
            this.setFieldNotRequired('smtpPort');
            this.setFieldNotRequired('smtpUsername');
        },

        controlSentFolderField: function () {
            if (this.model.get('useSmtp') && this.model.get('storeSentEmails')) {
                this.showField('sentFolder');
                this.setFieldRequired('sentFolder');

                return;
            }

            this.hideField('sentFolder');
            this.setFieldNotRequired('sentFolder');
        },

        controlSmtpAuthField: function () {
            if (this.model.get('smtpAuth')) {
                this.showField('smtpUsername');
                this.showField('smtpPassword');
                this.showField('smtpAuthMechanism');
                this.setFieldRequired('smtpUsername');

                return;
            }

            this.hideField('smtpUsername');
            this.hideField('smtpPassword');
            this.hideField('smtpAuthMechanism');
            this.setFieldNotRequired('smtpUsername');
        },

        controlStatusField: function () {
            let list = ['username', 'port', 'host', 'monitoredFolders'];

            if (this.model.get('status') === 'Active' && this.model.get('useImap')) {
                list.forEach(item => {
                    this.setFieldRequired(item);
                });

                return;
            }

            list.forEach(item => {
                this.setFieldNotRequired(item);
            });
        },

        setupFieldsBehaviour: function () {
            this.controlStatusField();

            this.listenTo(this.model, 'change:status', (model, value, o) => {
                if (o.ui) {
                    this.controlStatusField();
                }
            });

            this.listenTo(this.model, 'change:useImap', (model, value, o) => {
                if (o.ui) {
                    this.controlStatusField();
                }
            });

            if (this.wasFetched()) {
                this.setFieldReadOnly('fetchSince');
            } else {
                this.setFieldNotReadOnly('fetchSince');
            }

            this.initSmtpFieldsControl();

            let handleRequirement = (model) => {
                if (model.get('createCase')) {
                    this.showField('caseDistribution');
                } else {
                    this.hideField('caseDistribution');
                }

                if (
                    model.get('createCase') &&
                    ['Round-Robin', 'Least-Busy'].indexOf(model.get('caseDistribution')) !== -1
                ) {
                    this.setFieldRequired('team');
                    this.showField('targetUserPosition');
                } else {
                    this.setFieldNotRequired('team');
                    this.hideField('targetUserPosition');
                }

                if (model.get('createCase') && 'Direct-Assignment' === model.get('caseDistribution')) {
                    this.setFieldRequired('assignToUser');
                    this.showField('assignToUser');
                } else {
                    this.setFieldNotRequired('assignToUser');
                    this.hideField('assignToUser');
                }

                if (model.get('createCase') && model.get('createCase') !== '') {
                    this.showField('team');
                } else {
                    this.hideField('team');
                }
            };

            this.listenTo(this.model, 'change:createCase', (model, value, o) => {
                handleRequirement(model);

                if (!o.ui) {
                    return;
                }

                if (!model.get('createCase')) {
                    this.model.set({
                        caseDistribution: '',
                        teamId: null,
                        teamName: null,
                        assignToUserId: null,
                        assignToUserName: null,
                        targetUserPosition: '',
                    });
                }
            });

            handleRequirement(this.model);

            this.listenTo(this.model, 'change:caseDistribution', (model, value, o) => {
                handleRequirement(model);

                if (!o.ui) {
                    return;
                }

                setTimeout(() => {
                    if (!this.model.get('caseDistribution')) {
                        this.model.set({
                            assignToUserId: null,
                            assignToUserName: null,
                            targetUserPosition: ''
                        });

                        return;
                    }

                    if (this.model.get('caseDistribution') === 'Direct-Assignment') {
                        this.model.set({
                            targetUserPosition: '',
                        });
                    }

                    this.model.set({
                        assignToUserId: null,
                        assignToUserName: null,
                    });
                }, 10);
            });
        },

        initSslFieldListening: function () {
            this.listenTo(this.model, 'change:security', (model, value, o) => {
                if (!o.ui) {
                    return;
                }

                if (value) {
                    this.model.set('port', 993);
                } else {
                    this.model.set('port', 143);
                }
            });

            this.listenTo(this.model, 'change:smtpSecurity', (model, value, o) => {
                if (!o.ui) {
                    return;
                }

                if (value === 'SSL') {
                    this.model.set('smtpPort', 465);
                } else if (value === 'TLS') {
                    this.model.set('smtpPort', 587);
                } else {
                    this.model.set('smtpPort', 25);
                }
            });
        },
    });
});

define("views/admin/index", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
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

  class AdminIndexView extends _view.default {
    template = 'admin/index';
    events = {
      /** @this AdminIndexView */
      'click [data-action]': function (e) {
        Espo.Utils.handleAction(this, e.originalEvent, e.currentTarget);
      },
      /** @this AdminIndexView */
      'keyup input[data-name="quick-search"]': function (e) {
        this.processQuickSearch(e.currentTarget.value);
      }
    };
    data() {
      return {
        panelDataList: this.panelDataList,
        iframeUrl: this.iframeUrl,
        iframeHeight: this.getConfig().get('adminPanelIframeHeight') || 1330,
        iframeDisabled: this.getConfig().get('adminPanelIframeDisabled') || false
      };
    }
    afterRender() {
      let $quickSearch = this.$el.find('input[data-name="quick-search"]');
      if (this.quickSearchText) {
        $quickSearch.val(this.quickSearchText);
        this.processQuickSearch(this.quickSearchText);
      }

      // noinspection JSUnresolvedReference
      $quickSearch.get(0).focus({
        preventScroll: true
      });
    }
    setup() {
      this.panelDataList = [];
      let panels = this.getMetadata().get('app.adminPanel') || {};
      for (let name in panels) {
        let panelItem = Espo.Utils.cloneDeep(panels[name]);
        panelItem.name = name;
        panelItem.itemList = panelItem.itemList || [];
        panelItem.label = this.translate(panelItem.label, 'labels', 'Admin');
        if (panelItem.itemList) {
          panelItem.itemList.forEach(item => {
            item.label = this.translate(item.label, 'labels', 'Admin');
            if (item.description) {
              item.keywords = (this.getLanguage().get('Admin', 'keywords', item.description) || '').split(',');
            } else {
              item.keywords = [];
            }
          });
        }

        // Legacy support.
        if (panelItem.items) {
          panelItem.items.forEach(item => {
            item.label = this.translate(item.label, 'labels', 'Admin');
            panelItem.itemList.push(item);
            item.keywords = [];
          });
        }
        this.panelDataList.push(panelItem);
      }
      this.panelDataList.sort((v1, v2) => {
        if (!('order' in v1) && 'order' in v2) {
          return 0;
        }
        if (!('order' in v2)) {
          return 0;
        }
        return v1.order - v2.order;
      });
      let iframeParams = ['version=' + encodeURIComponent(this.getConfig().get('version')), 'css=' + encodeURIComponent(this.getConfig().get('siteUrl') + '/' + this.getThemeManager().getStylesheet())];
      this.iframeUrl = this.getConfig().get('adminPanelIframeUrl') || 'https://s.espocrm.com/';
      if (~this.iframeUrl.indexOf('?')) {
        this.iframeUrl += '&' + iframeParams.join('&');
      } else {
        this.iframeUrl += '?' + iframeParams.join('&');
      }
      if (!this.getConfig().get('adminNotificationsDisabled')) {
        this.createView('notificationsPanel', 'views/admin/panels/notifications', {
          selector: '.notifications-panel-container'
        });
      }
    }
    processQuickSearch(text) {
      text = text.trim();
      this.quickSearchText = text;
      let $noData = this.$noData || this.$el.find('.no-data');
      $noData.addClass('hidden');
      if (!text) {
        this.$el.find('.admin-content-section').removeClass('hidden');
        this.$el.find('.admin-content-row').removeClass('hidden');
        return;
      }
      text = text.toLowerCase();
      this.$el.find('.admin-content-section').addClass('hidden');
      this.$el.find('.admin-content-row').addClass('hidden');
      let anythingMatched = false;
      this.panelDataList.forEach((panel, panelIndex) => {
        let panelMatched = false;
        let panelLabelMatched = false;
        if (panel.label && panel.label.toLowerCase().indexOf(text) === 0) {
          panelMatched = true;
          panelLabelMatched = true;
        }
        panel.itemList.forEach((row, rowIndex) => {
          if (!row.label) {
            return;
          }
          let matched = false;
          if (panelLabelMatched) {
            matched = true;
          }
          if (!matched) {
            matched = row.label.toLowerCase().indexOf(text) === 0;
          }
          if (!matched) {
            let wordList = row.label.split(' ');
            wordList.forEach(word => {
              if (word.toLowerCase().indexOf(text) === 0) {
                matched = true;
              }
            });
            if (!matched) {
              matched = ~row.keywords.indexOf(text);
            }
            if (!matched) {
              if (text.length > 3) {
                row.keywords.forEach(word => {
                  if (word.indexOf(text) === 0) {
                    matched = true;
                  }
                });
              }
            }
          }
          if (matched) {
            panelMatched = true;
            this.$el.find('.admin-content-section[data-index="' + panelIndex.toString() + '"] ' + '.admin-content-row[data-index="' + rowIndex.toString() + '"]').removeClass('hidden');
            anythingMatched = true;
          }
        });
        if (panelMatched) {
          this.$el.find('.admin-content-section[data-index="' + panelIndex.toString() + '"]').removeClass('hidden');
          anythingMatched = true;
        }
      });
      if (!anythingMatched) {
        $noData.removeClass('hidden');
      }
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Administration'));
    }

    // noinspection JSUnusedGlobalSymbols
    actionClearCache() {
      this.trigger('clear-cache');
    }

    // noinspection JSUnusedGlobalSymbols
    actionRebuild() {
      this.trigger('rebuild');
    }
  }
  var _default = AdminIndexView;
  _exports.default = _default;
});

define("views/admin/link-manager/index", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
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

  /** @module views/admin/link-manager/index */

  class LinkManagerIndexView extends _view.default {
    template = 'admin/link-manager/index';
    scope = null;
    data() {
      return {
        linkDataList: this.linkDataList,
        scope: this.scope,
        isCreatable: this.isCustomizable
      };
    }
    events = {
      /** @this LinkManagerIndexView */
      'click a[data-action="editLink"]': function (e) {
        var link = $(e.currentTarget).data('link');
        this.editLink(link);
      },
      /** @this LinkManagerIndexView */
      'click button[data-action="createLink"]': function () {
        this.createLink();
      },
      /** @this LinkManagerIndexView */
      'click [data-action="removeLink"]': function (e) {
        var link = $(e.currentTarget).data('link');
        this.confirm(this.translate('confirmation', 'messages'), function () {
          this.removeLink(link);
        }, this);
      },
      /** @this LinkManagerIndexView */
      'keyup input[data-name="quick-search"]': function (e) {
        this.processQuickSearch(e.currentTarget.value);
      }
    };
    computeRelationshipType(type, foreignType) {
      if (type === 'hasMany') {
        if (foreignType === 'hasMany') {
          return 'manyToMany';
        } else if (foreignType === 'belongsTo') {
          return 'oneToMany';
        } else {
          return undefined;
        }
      } else if (type === 'belongsTo') {
        if (foreignType === 'hasMany') {
          return 'manyToOne';
        } else if (foreignType === 'hasOne') {
          return 'oneToOneRight';
        } else {
          return undefined;
        }
      } else if (type === 'belongsToParent') {
        if (foreignType === 'hasChildren') {
          return 'childrenToParent';
        }
        return undefined;
      } else if (type === 'hasChildren') {
        if (foreignType === 'belongsToParent') {
          return 'parentToChildren';
        }
        return undefined;
      } else if (type === 'hasOne') {
        if (foreignType === 'belongsTo') {
          return 'oneToOneLeft';
        }
        return undefined;
      }
    }
    setupLinkData() {
      this.linkDataList = [];
      this.isCustomizable = !!this.getMetadata().get(`scopes.${this.scope}.customizable`) && this.getMetadata().get(`scopes.${this.scope}.entityManager.relationships`) !== false;
      const links = this.getMetadata().get('entityDefs.' + this.scope + '.links');
      const linkList = Object.keys(links).sort((v1, v2) => {
        return v1.localeCompare(v2);
      });
      linkList.forEach(link => {
        var d = links[link];
        let type;
        var linkForeign = d.foreign;
        if (d.type === 'belongsToParent') {
          type = 'childrenToParent';
        } else {
          if (!d.entity) {
            return;
          }
          if (!linkForeign) {
            return;
          }
          var foreignType = this.getMetadata().get('entityDefs.' + d.entity + '.links.' + d.foreign + '.type');
          type = this.computeRelationshipType(d.type, foreignType);
        }
        if (!type) {
          return;
        }
        this.linkDataList.push({
          link: link,
          isCustom: d.isCustom,
          isRemovable: d.isCustom,
          customizable: d.customizable,
          isEditable: this.isCustomizable,
          type: type,
          entityForeign: d.entity,
          entity: this.scope,
          labelEntityForeign: this.getLanguage().translate(d.entity, 'scopeNames'),
          linkForeign: linkForeign,
          label: this.getLanguage().translate(link, 'links', this.scope),
          labelForeign: this.getLanguage().translate(d.foreign, 'links', d.entity)
        });
      });
    }
    setup() {
      this.scope = this.options.scope || null;
      this.setupLinkData();
      this.on('after:render', () => {
        this.renderHeader();
      });
    }
    afterRender() {
      this.$noData = this.$el.find('.no-data');
      this.$el.find('input[data-name="quick-search"]').focus();
    }
    createLink() {
      this.createView('edit', 'views/admin/link-manager/modals/edit', {
        scope: this.scope
      }, view => {
        view.render();
        this.listenTo(view, 'after:save', () => {
          this.clearView('edit');
          this.setupLinkData();
          this.render();
        });
        this.listenTo(view, 'close', () => {
          this.clearView('edit');
        });
      });
    }
    editLink(link) {
      this.createView('edit', 'views/admin/link-manager/modals/edit', {
        scope: this.scope,
        link: link
      }, view => {
        view.render();
        this.listenTo(view, 'after:save', () => {
          this.clearView('edit');
          this.setupLinkData();
          this.render();
        });
        this.listenTo(view, 'close', () => {
          this.clearView('edit');
        });
      });
    }
    removeLink(link) {
      Espo.Ajax.postRequest('EntityManager/action/removeLink', {
        entity: this.scope,
        link: link
      }).then(() => {
        this.$el.find('table tr[data-link="' + link + '"]').remove();
        this.getMetadata().loadSkipCache().then(() => {
          this.setupLinkData();
          Espo.Ui.success(this.translate('Removed'), {
            suppress: true
          });
          this.reRender();
        });
      });
    }
    renderHeader() {
      if (!this.scope) {
        $('#scope-header').html('');
        return;
      }
      $('#scope-header').show().html(this.getLanguage().translate(this.scope, 'scopeNames'));
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Entity Manager', 'labels', 'Admin'));
    }
    processQuickSearch(text) {
      text = text.trim();
      let $noData = this.$noData;
      $noData.addClass('hidden');
      if (!text) {
        this.$el.find('table tr.link-row').removeClass('hidden');
        return;
      }
      let matchedList = [];
      let lowerCaseText = text.toLowerCase();
      this.linkDataList.forEach(item => {
        let matched = false;
        let label = item.label || '';
        let link = item.link || '';
        let entityForeign = item.entityForeign || '';
        let labelEntityForeign = item.labelEntityForeign || '';
        if (label.toLowerCase().indexOf(lowerCaseText) === 0 || link.toLowerCase().indexOf(lowerCaseText) === 0 || entityForeign.toLowerCase().indexOf(lowerCaseText) === 0 || labelEntityForeign.toLowerCase().indexOf(lowerCaseText) === 0) {
          matched = true;
        }
        if (!matched) {
          let wordList = link.split(' ').concat(label.split(' ')).concat(entityForeign.split(' ')).concat(labelEntityForeign.split(' '));
          wordList.forEach(word => {
            if (word.toLowerCase().indexOf(lowerCaseText) === 0) {
              matched = true;
            }
          });
        }
        if (matched) {
          matchedList.push(link);
        }
      });
      if (matchedList.length === 0) {
        this.$el.find('table tr.link-row').addClass('hidden');
        $noData.removeClass('hidden');
        return;
      }
      this.linkDataList.map(item => item.link).forEach(scope => {
        if (!~matchedList.indexOf(scope)) {
          this.$el.find('table tr.link-row[data-link="' + scope + '"]').addClass('hidden');
          return;
        }
        this.$el.find('table tr.link-row[data-link="' + scope + '"]').removeClass('hidden');
      });
    }
  }
  var _default = LinkManagerIndexView;
  _exports.default = _default;
});

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

define('views/admin/layouts/list', ['views/admin/layouts/rows'], function (Dep) {

    return Dep.extend({

        dataAttributeList: [
            'name',
            'widthComplex',
            'width',
            'widthPx',
            'link',
            'notSortable',
            'noLabel',
            'align',
            'view',
            'customLabel',
            'label',
            'hidden',
        ],

        dataAttributesDefs: {
            widthComplex: {
                label: 'width',
                type: 'base',
                view: 'views/admin/layouts/fields/width-complex',
                tooltip: 'width',
                notStorable: true,
            },
            link: {
                type: 'bool',
                tooltip: true,
            },
            width: {
                type: 'float',
                min: 0,
                max: 100,
                hidden: true,
            },
            widthPx: {
                type: 'int',
                min: 0,
                max: 720,
                hidden: true,
            },
            notSortable: {
                type: 'bool',
                tooltip: true,
            },
            align: {
                type: 'enum',
                options: ['left', 'right'],
            },
            view: {
                type: 'varchar',
                readOnly: true,
            },
            noLabel: {
                type: 'bool',
                tooltip: true,
            },
            customLabel: {
                type: 'varchar',
                readOnly: true,
            },
            name: {
                type: 'varchar',
                readOnly: true,
            },
            label: {
                type: 'varchar',
                readOnly: true,
            },
            hidden: {
                type: 'bool',
            },
        },

        dataAttributesDynamicLogicDefs: {
            fields: {
                widthPx: {
                    visible: {
                        conditionGroup: [
                            {
                                attribute: 'width',
                                type: 'isEmpty',
                            }
                        ]
                    }
                },
            }
        },

        editable: true,
        languageCategory: 'fields',
        ignoreList: [],
        ignoreTypeList: [],

        setup: function () {
            Dep.prototype.setup.call(this);

            this.wait(true);

            this.loadLayout(() => {
                this.wait(false);
            });
        },

        loadLayout: function (callback) {
            this.getModelFactory().create(Espo.Utils.hyphenToUpperCamelCase(this.scope), (model) => {
                this.getHelper().layoutManager.getOriginal(this.scope, this.type, this.setId, (layout) => {
                    this.readDataFromLayout(model, layout);

                    if (callback) {
                        callback();
                    }
                });
            });
        },

        readDataFromLayout: function (model, layout) {
            const allFields = [];

            for (const field in model.defs.fields) {
                if (this.checkFieldType(model.getFieldParam(field, 'type')) && this.isFieldEnabled(model, field)) {

                    allFields.push(field);
                }
            }

            allFields.sort((v1, v2) => {
                return this.translate(v1, 'fields', this.scope)
                    .localeCompare(this.translate(v2, 'fields', this.scope));
            });

            this.enabledFieldsList = [];

            this.enabledFields = [];
            this.disabledFields = [];

            const labelList = [];
            const duplicateLabelList = [];

            for (const i in layout) {
                const label = this.getLanguage().translate(layout[i].name, 'fields', this.scope);

                if (~labelList.indexOf(label)) {
                    duplicateLabelList.push(label);
                }

                labelList.push(label);

                this.enabledFields.push({
                    name: layout[i].name,
                    label: label,
                });

                this.enabledFieldsList.push(layout[i].name);
            }

            for (const i in allFields) {
                if (!_.contains(this.enabledFieldsList, allFields[i])) {
                    const label = this.getLanguage().translate(allFields[i], 'fields', this.scope);

                    if (~labelList.indexOf(label)) {

                        duplicateLabelList.push(label);
                    }

                    labelList.push(label);

                    const fieldName = allFields[i];

                    const o = {
                        name: fieldName,
                        label: label,
                    };

                    const fieldType = this.getMetadata().get(['entityDefs', this.scope, 'fields', fieldName, 'type']);

                    if (fieldType) {
                        if (this.getMetadata().get(['fields', fieldType, 'notSortable'])) {
                            o.notSortable = true;

                            this.itemsData[fieldName] = this.itemsData[fieldName] || {};
                            this.itemsData[fieldName].notSortable = true;
                        }
                    }

                    this.disabledFields.push(o);
                }
            }

            this.enabledFields.forEach(item => {
                if (~duplicateLabelList.indexOf(item.label)) {
                    item.label += ' (' + item.name + ')';
                }
            });

            this.disabledFields.forEach(item => {
                if (~duplicateLabelList.indexOf(item.label)) {
                    item.label += ' (' + item.name + ')';
                }
            });

            this.rowLayout = layout;

            for (const i in this.rowLayout) {
                let label = this.getLanguage().translate(this.rowLayout[i].name, 'fields', this.scope);

                this.enabledFields.forEach(item => {
                    if (item.name === this.rowLayout[i].name) {
                        label = item.label;
                    }
                });

                this.rowLayout[i].label = label;
                this.itemsData[this.rowLayout[i].name] = Espo.Utils.cloneDeep(this.rowLayout[i]);
            }
        },

        // noinspection JSUnusedLocalSymbols
        checkFieldType: function (type) {
            return true;
        },

        isFieldEnabled: function (model, name) {
            if (this.ignoreList.indexOf(name) !== -1) {
                return false;
            }

            if (this.ignoreTypeList.indexOf(model.getFieldParam(name, 'type')) !== -1) {
                return false;
            }

            /** @type {string[]|null} */
            const layoutList = model.getFieldParam(name, 'layoutAvailabilityList');

            let realType = this.realType;

            if (realType === 'listSmall') {
                realType = 'list';
            }

            if (
                layoutList &&
                !layoutList.includes(this.type) &&
                !layoutList.includes(realType)
            ) {
                return false;
            }

            return !model.getFieldParam(name, 'disabled') &&
                !model.getFieldParam(name, 'utility') &&
                !model.getFieldParam(name, 'layoutListDisabled');
        },
    });
});

define("views/admin/layouts/index", ["exports", "view", "views/admin/layouts/default-page", "views/admin/layouts/modals/create"], function (_exports, _view, _defaultPage, _create) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _defaultPage = _interopRequireDefault(_defaultPage);
  _create = _interopRequireDefault(_create);
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

  class LayoutIndexView extends _view.default {
    template = 'admin/layouts/index';
    scopeList = null;
    baseUrl = '#Admin/layouts';
    typeList = ['list', 'detail', 'listSmall', 'detailSmall', 'bottomPanelsDetail', 'filters', 'massUpdate', 'sidePanelsDetail', 'sidePanelsEdit', 'sidePanelsDetailSmall', 'sidePanelsEditSmall'];
    /**
     * @type {string|null}
     */
    scope = null;
    /**
     * @type {string|null}
     */
    type = null;
    data() {
      return {
        scopeList: this.scopeList,
        typeList: this.typeList,
        scope: this.scope,
        layoutScopeDataList: this.getLayoutScopeDataList(),
        headerHtml: this.getHeaderHtml(),
        em: this.em
      };
    }
    setup() {
      this.addHandler('click', '#layouts-menu a.layout-link', 'onLayoutLinkClick');
      this.addHandler('click', 'a.accordion-toggle', 'onItemHeaderClick');
      this.addHandler('keydown.shortcuts', '', 'onKeyDown');
      this.addActionHandler('createLayout', () => this.actionCreateLayout());
      this.em = this.options.em || false;
      this.scope = this.options.scope || null;
      this.type = this.options.type || null;
      this.scopeList = [];
      const scopeFullList = this.getMetadata().getScopeList().sort((v1, v2) => {
        return this.translate(v1, 'scopeNamesPlural').localeCompare(this.translate(v2, 'scopeNamesPlural'));
      });
      scopeFullList.forEach(scope => {
        if (this.getMetadata().get('scopes.' + scope + '.entity') && this.getMetadata().get('scopes.' + scope + '.layouts')) {
          this.scopeList.push(scope);
        }
      });
      if (this.em && this.scope) {
        if (this.scopeList.includes(this.scope)) {
          this.scopeList = [this.scope];
        } else {
          this.scopeList = [];
        }
      }
      this.on('after:render', () => {
        $("#layouts-menu a[data-scope='" + this.options.scope + "'][data-type='" + this.options.type + "']").addClass('disabled');
        this.renderLayoutHeader();
        if (!this.options.scope || !this.options.type) {
          this.checkLayout();
          this.renderDefaultPage();
        }
        if (this.scope && this.options.type) {
          this.checkLayout();
          this.openLayout(this.options.scope, this.options.type);
        }
      });
    }
    checkLayout() {
      const scope = this.options.scope;
      const type = this.options.type;
      if (!scope) {
        return;
      }
      const item = this.getLayoutScopeDataList().find(item => item.scope === scope);
      if (!item) {
        throw new Espo.Exceptions.NotFound("Layouts not available for entity type.");
      }
      if (type && !item.typeList.includes(type)) {
        throw new Espo.Exceptions.NotFound("The layout type is not available for the entity type.");
      }
    }
    afterRender() {
      this.controlActiveButton();
    }
    controlActiveButton() {
      if (!this.scope) {
        return;
      }
      const $header = this.$el.find(`.accordion-toggle[data-scope="${this.scope}"]`);
      this.undisableLinks();
      if (this.em && this.scope && !this.type) {
        $header.addClass('disabled');
        return;
      }
      $header.removeClass('disabled');
      this.$el.find(`a.layout-link[data-scope="${this.scope}"][data-type="${this.type}"]`).addClass('disabled');
    }

    /**
     * @param {MouseEvent} e
     */
    onLayoutLinkClick(e) {
      e.preventDefault();
      const scope = $(e.target).data('scope');
      const type = $(e.target).data('type');
      if (this.getContentView()) {
        if (this.scope === scope && this.type === type) {
          return;
        }
      }
      this.getRouter().checkConfirmLeaveOut(() => {
        this.openLayout(scope, type);
        this.controlActiveButton();
      });
    }
    openDefaultPage() {
      this.clearView('content');
      this.type = null;
      this.renderDefaultPage();
      this.controlActiveButton();
      this.navigate(this.scope);
    }

    /**
     * @param {MouseEvent} e
     */
    onItemHeaderClick(e) {
      e.preventDefault();
      if (this.em) {
        if (!this.getContentView()) {
          return;
        }
        this.getRouter().checkConfirmLeaveOut(() => {
          this.openDefaultPage();
        });
        return;
      }
      const $target = $(e.target);
      const scope = $target.data('scope');
      const $collapse = $('.collapse[data-scope="' + scope + '"]');
      $collapse.hasClass('in') ? $collapse.collapse('hide') : $collapse.collapse('show');
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
      const key = Espo.Utils.getKeyFromKeyEvent(e);
      if (!this.hasView('content')) {
        return;
      }
      if (key === 'Control+Enter' || key === 'Control+KeyS') {
        e.stopPropagation();
        e.preventDefault();
        this.getContentView().actionSave();
      }
    }
    undisableLinks() {
      $("#layouts-menu a.layout-link").removeClass('disabled');
    }

    /**
     * @return {module:views/admin/layouts/base}
     */
    getContentView() {
      return this.getView('content');
    }
    openLayout(scope, type) {
      this.scope = scope;
      this.type = type;
      this.navigate(scope, type);
      Espo.Ui.notify(' ... ');
      const typeReal = this.getMetadata().get('clientDefs.' + scope + '.additionalLayouts.' + type + '.type') || type;
      this.createView('content', 'views/admin/layouts/' + Espo.Utils.camelCaseToHyphen(typeReal), {
        fullSelector: '#layout-content',
        scope: scope,
        type: type,
        realType: typeReal,
        setId: this.setId,
        em: this.em
      }, view => {
        this.renderLayoutHeader();
        view.render();
        Espo.Ui.notify(false);
        $(window).scrollTop(0);
        if (this.em) {
          this.listenToOnce(view, 'cancel', () => {
            this.openDefaultPage();
          });
          this.listenToOnce(view, 'after-delete', () => {
            this.openDefaultPage();
            Promise.all([this.getMetadata().loadSkipCache(), this.getLanguage().loadSkipCache()]).then(() => {
              this.reRender();
            });
          });
        }
      });
    }
    navigate(scope, type) {
      let url = '#Admin/layouts/scope=' + scope;
      if (type) {
        url += '&type=' + type;
      }
      if (this.em) {
        url += '&em=true';
      }
      this.getRouter().navigate(url, {
        trigger: false
      });
    }
    renderDefaultPage() {
      $('#layout-header').html('').hide();
      if (this.em) {
        this.assignView('default', new _defaultPage.default(), '#layout-content').then( /** LayoutDefaultPageView */view => {
          view.render();
        });
        return;
      }
      this.clearView('default');
      $('#layout-content').html(this.translate('selectLayout', 'messages', 'Admin'));
    }
    renderLayoutHeader() {
      const $header = $('#layout-header');
      if (!this.scope) {
        $header.html('');
        return;
      }
      const list = [];
      const separatorHtml = '<span class="breadcrumb-separator"><span class="chevron-right"></span></span>';
      if (!this.em) {
        list.push($('<span>').text(this.translate(this.scope, 'scopeNames')));
      }
      list.push($('<span>').text(this.translateLayoutName(this.type, this.scope)));
      const html = list.map($item => $item.get(0).outerHTML).join(' ' + separatorHtml + ' ');
      $header.show().html(html);
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Layout Manager', 'labels', 'Admin'));
    }
    getHeaderHtml() {
      const separatorHtml = '<span class="breadcrumb-separator"><span class="chevron-right"></span></span>';
      const list = [];
      const $root = $('<a>').attr('href', '#Admin').text(this.translate('Administration'));
      list.push($root);
      if (this.em) {
        list.push($('<a>').attr('href', '#Admin/entityManager').text(this.translate('Entity Manager', 'labels', 'Admin')));
        if (this.scope) {
          list.push($('<a>').attr('href', `#Admin/entityManager/scope=` + this.scope).text(this.translate(this.scope, 'scopeNames')));
          list.push($('<span>').text(this.translate('Layouts', 'labels', 'EntityManager')));
        }
      } else {
        list.push($('<span>').text(this.translate('Layout Manager', 'labels', 'Admin')));
      }
      return list.map($item => $item.get(0).outerHTML).join(' ' + separatorHtml + ' ');
    }
    translateLayoutName(type, scope) {
      if (this.getLanguage().get(scope, 'layouts', type)) {
        return this.getLanguage().translate(type, 'layouts', scope);
      }
      return this.getLanguage().translate(type, 'layouts', 'Admin');
    }
    getLayoutScopeDataList() {
      const dataList = [];
      this.scopeList.forEach(scope => {
        const item = {};
        let typeList = Espo.Utils.clone(this.typeList);
        item.scope = scope;
        item.url = this.baseUrl + '/scope=' + scope;
        if (this.em) {
          item.url += '&em=true';
        }
        if (this.getMetadata().get(['clientDefs', scope, 'bottomPanels', 'edit'])) {
          typeList.push('bottomPanelsEdit');
        }
        if (!this.getMetadata().get(['clientDefs', scope, 'defaultSidePanelDisabled']) && !this.getMetadata().get(['clientDefs', scope, 'defaultSidePanelFieldList'])) {
          typeList.push('defaultSidePanel');
        }
        if (this.getMetadata().get(['clientDefs', scope, 'kanbanViewMode'])) {
          typeList.push('kanban');
        }
        const additionalLayouts = this.getMetadata().get(['clientDefs', scope, 'additionalLayouts']) || {};
        for (const aItem in additionalLayouts) {
          typeList.push(aItem);
        }
        typeList = typeList.filter(name => {
          return !this.getMetadata().get(['clientDefs', scope, 'layout' + Espo.Utils.upperCaseFirst(name) + 'Disabled']);
        });
        const typeDataList = [];
        typeList.forEach(type => {
          let url = this.baseUrl + '/scope=' + scope + '&type=' + type;
          if (this.em) {
            url += '&em=true';
          }
          typeDataList.push({
            type: type,
            url: url,
            label: this.translateLayoutName(type, scope)
          });
        });
        item.typeList = typeList;
        item.typeDataList = typeDataList;
        dataList.push(item);
      });
      return dataList;
    }
    actionCreateLayout() {
      const view = new _create.default({
        scope: this.scope
      });
      this.assignView('dialog', view).then( /** LayoutCreateModalView */view => {
        view.render();
        this.listenToOnce(view, 'done', () => {
          Promise.all([this.getMetadata().loadSkipCache(), this.getLanguage().loadSkipCache()]).then(() => {
            this.reRender();
          });
        });
      });
    }
  }
  var _default = LayoutIndexView;
  _exports.default = _default;
});

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

define('views/admin/layouts/detail', ['views/admin/layouts/grid'], function (Dep) {

    return Dep.extend({

        dataAttributeList: [
            'name',
            'fullWidth',
            'customLabel',
            'noLabel',
        ],

        panelDataAttributeList: [
            'panelName',
            'dynamicLogicVisible',
            'style',
            'dynamicLogicStyled',
            'tabBreak',
            'tabLabel',
            'hidden',
        ],

        dataAttributesDefs: {
            fullWidth: {
                type: 'bool',
            },
            name: {
                readOnly: true,
            },
            label: {
                type: 'varchar',
                readOnly: true,
            },
            customLabel: {
                type: 'varchar',
                readOnly: true,
            },
            noLabel: {
                type: 'bool',
                readOnly: true,
            },
        },

        panelDataAttributesDefs: {
            panelName: {
                type: 'varchar',
            },
            style: {
                type: 'enum',
                options: [
                    'default',
                    'success',
                    'danger',
                    'warning',
                    'info',
                ],
                default: 'default',
                translation: 'LayoutManager.options.style',
                tooltip: 'panelStyle',
            },
            dynamicLogicVisible: {
                type: 'base',
                view: 'views/admin/field-manager/fields/dynamic-logic-conditions'
            },
            dynamicLogicStyled: {
                type: 'base',
                view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                tooltip: 'dynamicLogicStyled',
            },
            hidden: {
                type: 'bool',
                tooltip: 'hiddenPanel',
            },
            tabBreak: {
                type: 'bool',
                tooltip: 'tabBreak',
            },
            tabLabel: {
                type: 'varchar',
            },
        },

        defaultPanelFieldList: [
            'modifiedAt',
            'createdAt',
            'modifiedBy',
            'createdBy',
        ],

        panelDynamicLogicDefs: {
            fields: {
                tabLabel: {
                    visible: {
                        conditionGroup: [
                            {
                                attribute: 'tabBreak',
                                type: 'isTrue',
                            }
                        ]
                    }
                },
                dynamicLogicStyled: {
                    visible: {
                        conditionGroup: [
                            {
                                attribute: 'style',
                                type: 'notEquals',
                                value: 'default'
                            }
                        ]
                    }
                },
            }
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.panelDataAttributesDefs = Espo.Utils.cloneDeep(this.panelDataAttributesDefs);

            this.panelDataAttributesDefs.dynamicLogicVisible.scope = this.scope;
            this.panelDataAttributesDefs.dynamicLogicStyled.scope = this.scope;

            this.wait(true);

            this.loadLayout(() => {
                this.setupPanels();
                this.wait(false);
            });
        },

        loadLayout: function (callback) {
            let layout;
            let model;

            const promiseList = [];

            promiseList.push(
                new Promise(resolve => {
                    this.getModelFactory().create(this.scope, (m) => {
                        this.getHelper()
                            .layoutManager
                            .getOriginal(this.scope, this.type, this.setId, (layoutLoaded) => {
                                layout = layoutLoaded;
                                model = m;
                                resolve();
                            });
                    });
                })
            );

            if (['detail', 'detailSmall'].includes(this.type)) {
                promiseList.push(
                    new Promise(resolve => {
                        this.getHelper().layoutManager.getOriginal(
                            this.scope, 'sidePanels' + Espo.Utils.upperCaseFirst(this.type),
                            this.setId,
                            layoutLoaded => {
                                this.sidePanelsLayout = layoutLoaded;

                                resolve();
                            }
                        );
                    })
                );
            }

            promiseList.push(
                new Promise(resolve => {
                    if (this.getMetadata().get(['clientDefs', this.scope, 'layoutDefaultSidePanelDisabled'])) {
                        resolve();

                        return;
                    }

                    if (this.typeDefs.allFields) {
                        resolve();

                        return;
                    }

                    this.getHelper().layoutManager.getOriginal(
                        this.scope,
                        'defaultSidePanel',
                        this.setId,
                        layoutLoaded => {
                            this.defaultPanelFieldList = Espo.Utils.clone(this.defaultPanelFieldList);

                            layoutLoaded.forEach(item => {
                                let field = item.name;

                                if (!field) {
                                    return;
                                }

                                if (field === ':assignedUser') {
                                    field = 'assignedUser';
                                }

                                if (!this.defaultPanelFieldList.includes(field)) {
                                    this.defaultPanelFieldList.push(field);
                                }
                            });

                            resolve();
                        }
                    );
                })
            );

            Promise.all(promiseList).then(() => {
                this.readDataFromLayout(model, layout);

                if (callback) {
                    callback();
                }
            });
        },

        readDataFromLayout: function (model, layout) {
            const allFields = [];

            for (const field in model.defs.fields) {
                if (this.isFieldEnabled(model, field)) {
                    allFields.push(field);
                }
            }

            this.enabledFields = [];
            this.disabledFields = [];

            this.panels = layout;

            layout.forEach((panel) => {
                panel.rows.forEach((row) => {
                    row.forEach(cell => {
                        this.enabledFields.push(cell.name);
                    });
                });
            });

            allFields.sort((v1, v2) => {
                return this.translate(v1, 'fields', this.scope)
                    .localeCompare(this.translate(v2, 'fields', this.scope));
            });

            for (const i in allFields) {
                if (!_.contains(this.enabledFields, allFields[i])) {
                    this.disabledFields.push(allFields[i]);
                }
            }
        },

        isFieldEnabled: function (model, name) {
            if (this.hasDefaultPanel()) {
                if (this.defaultPanelFieldList.includes(name)) {
                    return false;
                }
            }

            const layoutList = model.getFieldParam(name, 'layoutAvailabilityList');

            let realType = this.realType;

            if (realType === 'detailSmall') {
                realType = 'detail';
            }

            if (
                layoutList &&
                !layoutList.includes(this.type) &&
                !layoutList.includes(realType)
            ) {
                return;
            }

            return !model.getFieldParam(name, 'disabled') &&
                !model.getFieldParam(name, 'utility') &&
                !model.getFieldParam(name, 'layoutDetailDisabled');
        },

        hasDefaultPanel: function () {
            if (this.getMetadata().get(['clientDefs', this.scope, 'defaultSidePanel', this.viewType]) === false) {
                return false;
            }

            if (this.getMetadata().get(['clientDefs', this.scope, 'defaultSidePanelDisabled'])) {
                return false;
            }

            if (this.sidePanelsLayout) {
                for (const name in this.sidePanelsLayout) {
                    if (name === 'default' && this.sidePanelsLayout[name].disabled) {
                        return false;
                    }
                }
            }

            return true;
        },

        validate: function (layout) {
            if (!Dep.prototype.validate.call(this, layout)) {
                return false;
            }

            const fieldList = [];

            layout.forEach(panel => {
                panel.rows.forEach(row => {
                    row.forEach(cell => {
                        if (cell !== false && cell !== null) {
                            if (cell.name) {
                                fieldList.push(cell.name);
                            }
                        }
                    });
                });
            });

            let incompatibleFieldList = [];

            let isIncompatible = false;

            fieldList.forEach(field => {
                if (isIncompatible) {
                    return;
                }

                const defs = this.getMetadata().get(['entityDefs', this.scope, 'fields', field]) || {};

                const targetFieldList = defs.detailLayoutIncompatibleFieldList || [];

                targetFieldList.forEach(itemField => {
                    if (isIncompatible) {
                        return;
                    }

                    if (~fieldList.indexOf(itemField)) {
                        isIncompatible = true;

                        incompatibleFieldList = [field].concat(targetFieldList);
                    }
                });
            });

            if (isIncompatible) {
                Espo.Ui.error(
                    this.translate('fieldsIncompatible', 'messages', 'LayoutManager')
                        .replace(
                            '{fields}',
                            incompatibleFieldList
                                .map(field => this.translate(field, 'fields', this.scope))
                                .join(', ')
                        )
                );

                return false;
            }

            return true;
        },
    });
});

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

define('views/admin/layouts/bottom-panels-edit', ['views/admin/layouts/bottom-panels-detail'], function (Dep) {

    return Dep.extend({

        hasStream: false,

        hasRelationships: false,

        viewType: 'edit',
    });
});

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

define('views/admin/integrations/edit', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'admin/integrations/edit',

        data: function () {
            return {
                integration: this.integration,
                dataFieldList: this.dataFieldList,
                helpText: this.helpText
            };
        },

        events: {
            'click button[data-action="cancel"]': function () {
                this.getRouter().navigate('#Admin/integrations', {trigger: true});
            },
            'click button[data-action="save"]': function () {
                this.save();
            },
        },

        setup: function () {
            this.integration = this.options.integration;

            this.helpText = false;

            if (this.getLanguage().has(this.integration, 'help', 'Integration')) {
                this.helpText = this.translate(this.integration, 'help', 'Integration');
            }

            this.fieldList = [];

            this.dataFieldList = [];

            this.model = new Model();
            this.model.id = this.integration;
            this.model.name = 'Integration';
            this.model.urlRoot = 'Integration';

            this.model.defs = {
                fields: {
                    enabled: {
                        required: true,
                        type: 'bool',
                    },
                }
            };

            this.wait(true);

            this.fields = this.getMetadata().get('integrations.' + this.integration + '.fields');

            Object.keys(this.fields).forEach(name => {
                this.model.defs.fields[name] = this.fields[name];
                this.dataFieldList.push(name);
            });

            this.model.populateDefaults();

            this.listenToOnce(this.model, 'sync', () => {
                this.createFieldView('bool', 'enabled');

                Object.keys(this.fields).forEach(name => {
                    this.createFieldView(this.fields[name]['type'], name, null, this.fields[name]);
                });

                this.wait(false);
            });

            this.model.fetch();
        },

        hideField: function (name) {
            this.$el.find('label[data-name="'+name+'"]').addClass('hide');
            this.$el.find('div.field[data-name="'+name+'"]').addClass('hide');

            var view = this.getView(name);

            if (view) {
                view.disabled = true;
            }
        },

        showField: function (name) {
            this.$el.find('label[data-name="'+name+'"]').removeClass('hide');
            this.$el.find('div.field[data-name="'+name+'"]').removeClass('hide');

            var view = this.getView(name);

            if (view) {
                view.disabled = false;
            }
        },

        afterRender: function () {
            if (!this.model.get('enabled')) {
                this.dataFieldList.forEach(name => {
                    this.hideField(name);
                });
            }

            this.listenTo(this.model, 'change:enabled', () => {
                if (this.model.get('enabled')) {
                    this.dataFieldList.forEach(name => {
                        this.showField(name);
                    });
                } else {
                    this.dataFieldList.forEach(name => {
                        this.hideField(name);
                    });
                }
            });
        },

        createFieldView: function (type, name, readOnly, params) {
            var viewName = this.model.getFieldParam(name, 'view') || this.getFieldManager().getViewName(type);

            this.createView(name, viewName, {
                model: this.model,
                selector: '.field[data-name="' + name + '"]',
                defs: {
                    name: name,
                    params: params
                },
                mode: readOnly ? 'detail' : 'edit',
                readOnly: readOnly,
            });

            this.fieldList.push(name);
        },

        save: function () {
            this.fieldList.forEach(field => {
                var view = this.getView(field);

                if (!view.readOnly) {
                    view.fetchToModel();
                }
            });

            var notValid = false;

            this.fieldList.forEach(field => {
                var fieldView = this.getView(field);

                if (fieldView && !fieldView.disabled) {
                    notValid = fieldView.validate() || notValid;
                }
            });

            if (notValid) {
                this.notify('Not valid', 'error');

                return;
            }

            this.listenToOnce(this.model, 'sync', () => {
                this.notify('Saved', 'success');
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            this.model.save();
        },
    });
});

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

define('views/admin/field-manager/fields/options', ['views/fields/array'], function (Dep) {

    return Dep.extend({

        maxItemLength: 100,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.translatedOptions = {};

            let list = this.model.get(this.name) || [];

            list.forEach(value => {
                this.translatedOptions[value] = this.getLanguage()
                    .translateOption(value, this.options.field, this.options.scope);
            });

            this.model.fetchedAttributes.translatedOptions = this.translatedOptions;
        },

        getItemHtml: function (value) {
            // Do not use the `html` method to avoid XSS.

            let text = (this.translatedOptions[value] || value);

            let $div = $('<div>')
                .addClass('list-group-item link-with-role form-inline')
                .attr('data-value', value)
                .append(
                    $('<div>')
                        .addClass('pull-left item-content')
                        .css('width', '92%')
                        .css('display', 'inline-block')
                        .append(
                            $('<input>')
                                .attr('type', 'text')
                                .attr('data-name', 'translatedValue')
                                .attr('data-value', value)
                                .addClass('role form-control input-sm pull-right')
                                .attr('value', text)
                                .css('width', 'auto')
                        )
                        .append(
                            $('<div>')
                                .addClass('item-text')
                                .text(value)
                        )
                )
                .append(
                    $('<div>')
                        .css('width', '8%')
                        .css('display', 'inline-block')
                        .css('vertical-align', 'top')
                        .append(
                            $('<a>')
                                .attr('role', 'button')
                                .attr('tabindex', '0')
                                .addClass('pull-right')
                                .attr('data-value', value)
                                .attr('data-action', 'removeValue')
                                .append(
                                    $('<span>').addClass('fas fa-times')
                                )
                        )
                )
                .append(
                    $('<br>').css('clear', 'both')
                );

            return $div.get(0).outerHTML;
        },

        fetch: function () {
            let data = Dep.prototype.fetch.call(this);

            if (!data[this.name].length) {
                data[this.name] = null;
                data.translatedOptions = {};

                return data;
            }

            data.translatedOptions = {};

            (data[this.name] || []).forEach(value => {
                let valueInternal = value.replace(/"/g, '\\"');

                let translatedValue = this.$el
                    .find('input[data-name="translatedValue"][data-value="'+valueInternal+'"]').val() || value;

                data.translatedOptions[value] = translatedValue.toString();
            });

            return data;
        },
    });
});

define("views/admin/entity-manager/record/edit-formula", ["exports", "views/record/base"], function (_exports, _base) {
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

  class EntityManagerEditFormulaRecordView extends _base.default {
    template = 'admin/entity-manager/record/edit-formula';
    data() {
      return {
        field: this.field,
        fieldKey: this.field + 'Field'
      };
    }
    setup() {
      super.setup();
      this.field = this.options.type;
      let additionalFunctionDataList = null;
      if (this.options.type === 'beforeSaveApiScript') {
        additionalFunctionDataList = this.getRecordServiceFunctionDataList();
      }
      this.createField(this.field, 'views/fields/formula', {
        targetEntityType: this.options.targetEntityType,
        height: 500
      }, 'edit', false, {
        additionalFunctionDataList: additionalFunctionDataList
      });
    }
    getRecordServiceFunctionDataList() {
      return [{
        name: 'recordService\\skipDuplicateCheck',
        insertText: 'recordService\\skipDuplicateCheck()',
        returnType: 'bool'
      }, {
        name: 'recordService\\throwDuplicateConflict',
        insertText: 'recordService\\throwDuplicateConflict(RECORD_ID)'
      }, {
        name: 'recordService\\throwBadRequest',
        insertText: 'recordService\\throwBadRequest(MESSAGE)'
      }, {
        name: 'recordService\\throwForbidden',
        insertText: 'recordService\\throwForbidden(MESSAGE)'
      }, {
        name: 'recordService\\throwConflict',
        insertText: 'recordService\\throwConflict(MESSAGE)'
      }];
    }
  }
  var _default = EntityManagerEditFormulaRecordView;
  _exports.default = _default;
});

define("views/admin/entity-manager/modals/export", ["exports", "views/modal", "model", "views/record/edit-for-modal", "views/fields/varchar"], function (_exports, _modal, _model, _editForModal, _varchar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _modal = _interopRequireDefault(_modal);
  _model = _interopRequireDefault(_model);
  _editForModal = _interopRequireDefault(_editForModal);
  _varchar = _interopRequireDefault(_varchar);
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

  class EntityManagerExportModalView extends _modal.default {
    // language=Handlebars
    templateContent = `
        <div class="record-container no-side-margin">{{{record}}}</div>
    `;
    setup() {
      this.headerText = this.translate('Export');
      this.buttonList = [{
        name: 'export',
        label: 'Export',
        style: 'danger',
        onClick: () => this.export()
      }, {
        name: 'cancel',
        label: 'Cancel'
      }];
      let manifest = this.getConfig().get('customExportManifest') || {};
      this.model = new _model.default({
        name: manifest.name ?? null,
        module: manifest.module ?? null,
        version: manifest.version ?? '0.0.1',
        author: manifest.author ?? null,
        description: manifest.description ?? null
      });
      this.recordView = new _editForModal.default({
        model: this.model,
        detailLayout: [{
          rows: [[{
            view: new _varchar.default({
              name: 'name',
              labelText: this.translate('name', 'fields'),
              params: {
                pattern: '$latinLettersDigitsWhitespace',
                required: true
              }
            })
          }, {
            view: new _varchar.default({
              name: 'module',
              labelText: this.translate('module', 'fields', 'EntityManager'),
              params: {
                pattern: '[A-Z][a-z][A-Za-z]+',
                required: true
              }
            })
          }], [{
            view: new _varchar.default({
              name: 'version',
              labelText: this.translate('version', 'fields', 'EntityManager'),
              params: {
                pattern: '[0-9]+\\.[0-9]+\\.[0-9]+',
                required: true
              }
            })
          }, false], [{
            view: new _varchar.default({
              name: 'author',
              labelText: this.translate('author', 'fields', 'EntityManager'),
              params: {
                required: true
              }
            })
          }, {
            view: new _varchar.default({
              name: 'description',
              labelText: this.translate('description', 'fields'),
              params: {}
            })
          }]]
        }]
      });
      this.assignView('record', this.recordView);
    }
    export() {
      const data = this.recordView.fetch();
      if (this.recordView.validate()) {
        return;
      }
      this.disableButton('export');
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('EntityManager/action/exportCustom', data).then(response => {
        this.close();
        this.getConfig().set('customExportManifest', data);
        Espo.Ui.success(this.translate('Done'));
        window.location = this.getBasePath() + '?entryPoint=download&id=' + response.id;
      }).catch(() => this.enableButton('create'));
    }
  }
  var _default = EntityManagerExportModalView;
  _exports.default = _default;
});

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

define('views/admin/dynamic-logic/conditions-string/item-operator-only-date',
['views/admin/dynamic-logic/conditions-string/item-operator-only-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-operator-only-date',

        data: function () {
            var data = Dep.prototype.data.call(this);
            data.dateValue = this.dateValue;
            return data;
        },
    });
});

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

define('views/admin/dynamic-logic/conditions-string/group-base', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/group-base',

        data: function () {
            if (!this.conditionList.length) {
                return {
                    isEmpty: true
                };
            }

            return {
                viewDataList: this.viewDataList,
                operator: this.operator,
                level: this.level
            };
        },

        setup: function () {
            this.level = this.options.level || 0;
            this.number = this.options.number || 0;
            this.scope = this.options.scope;

            this.operator = this.options.operator || this.operator;

            this.itemData = this.options.itemData || {};
            this.viewList = [];

            const conditionList = this.conditionList = this.itemData.value || [];

            this.viewDataList = [];

            conditionList.forEach((item, i) => {
                const key = 'view-' + this.level.toString() + '-' + this.number.toString() + '-' + i.toString();

                this.createItemView(i, key, item);
                this.viewDataList.push({
                    key: key,
                    isEnd: i === conditionList.length - 1,
                });
            });
        },

        getFieldType: function (item) {
            return this.getMetadata()
                .get(['entityDefs', this.scope, 'fields', item.attribute, 'type']) || 'base';
        },

        createItemView: function (number, key, item) {
            this.viewList.push(key);

            item = item || {};

            const additionalData = item.data || {};

            const type = additionalData.type || item.type || 'equals';
            const fieldType = this.getFieldType(item);

            const viewName = this.getMetadata()
                .get(['clientDefs', 'DynamicLogic', 'fieldTypes', fieldType, 'conditionTypes', type, 'itemView']) ||
                this.getMetadata()
                    .get(['clientDefs', 'DynamicLogic', 'itemTypes', type, 'view']);

            if (!viewName) {
                return;
            }

            const operator = this.getMetadata()
                .get(['clientDefs', 'DynamicLogic', 'itemTypes', type, 'operator']);

            let operatorString = this.getMetadata()
                .get(['clientDefs', 'DynamicLogic', 'itemTypes', type, 'operatorString']);

            if (!operatorString) {
                operatorString = this.getLanguage()
                    .translateOption(type, 'operators', 'DynamicLogic')
                    .toLowerCase();

                operatorString = '<i class="small">' + operatorString + '</i>';
            }

            this.createView(key, viewName, {
                itemData: item,
                scope: this.scope,
                level: this.level + 1,
                selector: '[data-view-key="'+key+'"]',
                number: number,
                operator: operator,
                operatorString: operatorString,
            });
        },
    });
});

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

define('views/admin/dynamic-logic/conditions/group-base', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions/group-base',

        data: function () {
            return {
                viewDataList: this.viewDataList,
                operator: this.operator,
                level: this.level,
                groupOperator: this.getGroupOperator(),
            };
        },

        events: {
            'click > div.group-head > [data-action="remove"]': function (e) {
                e.stopPropagation();

                this.trigger('remove-item');
            },
            'click > div.group-bottom [data-action="addField"]': function () {
                this.actionAddField();
            },
            'click > div.group-bottom [data-action="addAnd"]': function () {
                this.actionAddGroup('and');
            },
            'click > div.group-bottom [data-action="addOr"]': function () {
                this.actionAddGroup('or');
            },
            'click > div.group-bottom [data-action="addNot"]': function () {
                this.actionAddGroup('not');
            },
            'click > div.group-bottom [data-action="addCurrentUser"]': function () {
                this.addCurrentUser();
            },
            'click > div.group-bottom [data-action="addCurrentUserTeams"]': function () {
                this.addCurrentUserTeams();
            },
        },

        setup: function () {
            this.level = this.options.level || 0;
            this.number = this.options.number || 0;
            this.scope = this.options.scope;

            this.itemData = this.options.itemData || {};
            this.viewList = [];

            const conditionList = this.conditionList = this.itemData.value || [];

            this.viewDataList = [];

            conditionList.forEach((item, i) => {
                const key = this.getKey(i);

                this.createItemView(i, key, item);
                this.addViewDataListItem(i, key);
            });
        },

        getGroupOperator: function () {
            if (this.operator === 'or') {
                return 'or';
            }

            return 'and';
        },

        getKey: function (i) {
            return 'view-' + this.level.toString() + '-' + this.number.toString() + '-' + i.toString();
        },

        createItemView: function (number, key, item) {
            this.viewList.push(key);

            this.isCurrentUser = item.attribute && item.attribute.startsWith('$user.');

            const scope = this.isCurrentUser ? 'User' : this.scope;

            item = item || {};

            const additionalData = item.data || {};

            const type = additionalData.type || item.type || 'equals';
            const field = additionalData.field || item.attribute;

            let viewName;
            let fieldType;

            if (['and', 'or', 'not'].includes(type)) {
                viewName = 'views/admin/dynamic-logic/conditions/' + type;
            } else {
                fieldType = this.getMetadata().get(['entityDefs', scope, 'fields', field, 'type']);

                if (field === 'id') {
                    fieldType = 'id';
                }

                if (item.attribute === '$user.id') {
                    fieldType = 'currentUser';
                }

                if (item.attribute === '$user.teamsIds') {
                    fieldType = 'currentUserTeams';
                }

                if (fieldType) {
                    viewName = this.getMetadata().get(['clientDefs', 'DynamicLogic', 'fieldTypes', fieldType, 'view']);
                }
            }

            if (!viewName) {
                return;
            }

            this.createView(key, viewName, {
                itemData: item,
                scope: scope,
                level: this.level + 1,
                selector: '[data-view-key="' + key + '"]',
                number: number,
                type: type,
                field: field,
                fieldType: fieldType,
            }, (view) => {
                if (this.isRendered()) {
                    view.render()
                }

                this.controlAddItemVisibility();

                this.listenToOnce(view, 'remove-item', () => {
                    this.removeItem(number);
                });
            });
        },

        fetch: function () {
            const list = [];

            this.viewDataList.forEach(item => {
                const view = this.getView(item.key);

                list.push(view.fetch());
            });

            return {
                type: this.operator,
                value: list
            };
        },

        removeItem: function (number) {
            const key = this.getKey(number);

            this.clearView(key);

            this.$el.find('[data-view-key="'+key+'"]').remove();
            this.$el.find('[data-view-ref-key="'+key+'"]').remove();

            let index = -1;

            this.viewDataList.forEach((data, i) => {
                if (data.index === number) {
                    index = i;
                }
            });

            if (~index) {
                this.viewDataList.splice(index, 1);
            }

            this.controlAddItemVisibility();
        },

        actionAddField: function () {
            this.createView('modal', 'views/admin/dynamic-logic/modals/add-field', {
                scope: this.scope
            }, (view) => {
                view.render();

                this.listenToOnce(view, 'add-field', (field) => {
                    this.addField(field);

                    view.close();
                });
            });
        },

        addCurrentUser: function () {
            const i = this.getIndexForNewItem();
            const key = this.getKey(i);

            this.addItemContainer(i);
            this.addViewDataListItem(i, key);

            this.createItemView(i, key, {
                attribute: '$user.id',
                data: {
                    type: 'equals',
                },
            });
        },

        addCurrentUserTeams: function () {
            const i = this.getIndexForNewItem();
            const key = this.getKey(i);

            this.addItemContainer(i);
            this.addViewDataListItem(i, key);

            this.createItemView(i, key, {
                attribute: '$user.teamsIds',
                data: {
                    type: 'contains',
                    field: 'teams',
                },
            });
        },

        addField: function (field) {
            let fieldType = this.getMetadata().get(['entityDefs', this.scope, 'fields', field, 'type']);

            if (!fieldType && field === 'id') {
                fieldType = 'id';
            }

            if (!this.getMetadata().get(['clientDefs', 'DynamicLogic', 'fieldTypes', fieldType])) {
                throw new Error();
            }

            const type = this.getMetadata().get(['clientDefs', 'DynamicLogic', 'fieldTypes', fieldType, 'typeList'])[0];

            const i = this.getIndexForNewItem();
            const key = this.getKey(i);

            this.addItemContainer(i);
            this.addViewDataListItem(i, key);

            this.createItemView(i, key, {
                data: {
                    field: field,
                    type: type
                },
            });
        },

        getIndexForNewItem: function () {
            if (!this.viewDataList.length) {
                return 0;
            }

            return (this.viewDataList[this.viewDataList.length - 1]).index + 1;
        },

        addViewDataListItem: function (i, key) {
            this.viewDataList.push({
                index: i,
                key: key,
            });
        },

        addItemContainer: function (i) {
            const $item = $('<div data-view-key="' + this.getKey(i) + '"></div>');
            this.$el.find('> .item-list').append($item);

            const groupOperatorLabel = this.translate(this.getGroupOperator(), 'logicalOperators', 'Admin');

            const $operatorItem = $(
                '<div class="group-operator" data-view-ref-key="' + this.getKey(i) + '">' +
                groupOperatorLabel + '</div>');

            this.$el.find('> .item-list').append($operatorItem);
        },

        actionAddGroup: function (operator) {
            const i = this.getIndexForNewItem();
            const key = this.getKey(i);

            this.addItemContainer(i);
            this.addViewDataListItem(i, key);

            this.createItemView(i, key, {
                type: operator,
                value: [],
            });
        },

        afterRender: function () {
            this.controlAddItemVisibility();
        },

        controlAddItemVisibility: function () {},
    });
});

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

define('views/admin/dynamic-logic/conditions/field-types/link-multiple',
['views/admin/dynamic-logic/conditions/field-types/base'], function (Dep) {

    return Dep.extend({

        getValueFieldName: function () {
            return this.name;
        },

        getValueViewName: function () {
            return 'views/fields/link';
        },

        createValueViewContains: function () {
            this.createLinkValueField();
        },

        createValueViewNotContains: function () {
            this.createLinkValueField();
        },

        createLinkValueField: function () {
            const viewName = 'views/fields/link';
            const fieldName = 'link';

            this.createView('value', viewName, {
                model: this.model,
                name: fieldName,
                selector: '.value-container',
                mode: 'edit',
                readOnlyDisabled: true,
                foreignScope: this.getMetadata()
                    .get(['entityDefs', this.scope, 'fields', this.field, 'entity']) ||
                    this.getMetadata().get(['entityDefs', this.scope, 'links', this.field, 'entity']),
            }, (view) => {
                if (this.isRendered()) {
                    view.render();
                }
            });
        },

        fetch: function () {
            const valueView = this.getView('value');

            const item = {
                type: this.type,
                attribute: this.field + 'Ids',
                data: {
                    field: this.field,
                },
            };

            if (valueView) {
                valueView.fetchToModel();

                item.value = this.model.get('linkId');

                const values = {};

                values['linkName'] = this.model.get('linkName');
                values['linkId'] = this.model.get('linkId');

                item.data.values = values;
            }

            return item;
        },
    });
});

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

define('views/email-account/fields/test-send', ['views/outbound-email/fields/test-send'], function (Dep) {

    return Dep.extend({

        checkAvailability: function () {
            if (this.model.get('smtpHost')) {
                this.$el.find('button').removeClass('hidden');
            } else {
                this.$el.find('button').addClass('hidden');
            }
        },

        afterRender: function () {
            this.checkAvailability();

            this.stopListening(this.model, 'change:smtpHost');

            this.listenTo(this.model, 'change:smtpHost', () => {
                this.checkAvailability();
            });
        },

        getSmtpData: function () {
            return {
                'server': this.model.get('smtpHost'),
                'port': this.model.get('smtpPort'),
                'auth': this.model.get('smtpAuth'),
                'security': this.model.get('smtpSecurity'),
                'username': this.model.get('smtpUsername'),
                'password': this.model.get('smtpPassword') || null,
                'authMechanism': this.model.get('smtpAuthMechanism'),
                'fromName': this.getUser().get('name'),
                'fromAddress': this.model.get('emailAddress'),
                'type': 'emailAccount',
                'id': this.model.id,
                'userId': this.model.get('assignedUserId'),
            };
        },
    });
});

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

define('views/email-account/fields/test-connection', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        readOnly: true,

        templateContent:
            '<button class="btn btn-default disabled" data-action="testConnection">'+
            '{{translate \'Test Connection\' scope=\'EmailAccount\'}}</button>',

        url: 'EmailAccount/action/testConnection',

        events: {
            'click [data-action="testConnection"]': function () {
                this.test();
            },
        },

        fetch: function () {
            return {};
        },

        checkAvailability: function () {
            if (this.model.get('host')) {
                this.$el.find('button').removeClass('disabled').removeAttr('disabled');
            } else {
                this.$el.find('button').addClass('disabled').attr('disabled', 'disabled');
            }
        },

        afterRender: function () {
            this.checkAvailability();

            this.stopListening(this.model, 'change:host');

            this.listenTo(this.model, 'change:host', () => {
                this.checkAvailability();
            });
        },

        getData: function () {
            return {
                'host': this.model.get('host'),
                'port': this.model.get('port'),
                'security': this.model.get('security'),
                'username': this.model.get('username'),
                'password': this.model.get('password') || null,
                'id': this.model.id,
                emailAddress: this.model.get('emailAddress'),
                userId: this.model.get('assignedUserId'),
            };
        },

        test: function () {
            let data = this.getData();

            let $btn = this.$el.find('button');

            $btn.addClass('disabled');

            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            Espo.Ajax.postRequest(this.url, data)
                .then(() => {
                    $btn.removeClass('disabled');

                    Espo.Ui.success(this.translate('connectionIsOk', 'messages', 'EmailAccount'));
                })
                .catch(xhr => {
                    let statusReason = xhr.getResponseHeader('X-Status-Reason') || '';
                    statusReason = statusReason.replace(/ $/, '');
                    statusReason = statusReason.replace(/,$/, '');

                    let msg = this.translate('Error');

                    if (parseInt(xhr.status) !== 200) {
                        msg += ' ' + xhr.status;
                    }

                    if (statusReason) {
                        msg += ': ' + statusReason;
                    }

                    Espo.Ui.error(msg, true);

                    console.error(msg);

                    xhr.errorIsHandled = true;

                    $btn.removeClass('disabled');
                });
        },
    });
});

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

define('views/email-account/fields/folders', ['views/fields/array'], function (Dep) {

    return Dep.extend({

        getFoldersUrl: 'EmailAccount/action/getFolders',

        setupOptions: function () {
            this.params.options = ['INBOX'];
        },

        fetchFolders: function () {
            return new Promise(resolve => {
                var data = {
                    host: this.model.get('host'),
                    port: this.model.get('port'),
                    security: this.model.get('security'),
                    username: this.model.get('username'),
                    emailAddress: this.model.get('emailAddress'),
                    userId: this.model.get('assignedUserId'),
                };

                if (this.model.has('password')) {
                    data.password = this.model.get('password');
                }

                if (!this.model.isNew()) {
                    data.id = this.model.id;
                }

                Espo.Ajax.postRequest(this.getFoldersUrl, data)
                    .then(folders => {
                        resolve(folders);
                    })
                    .catch(xhr =>{
                        Espo.Ui.error(this.translate('couldNotConnectToImap', 'messages', 'EmailAccount'));

                        xhr.errorIsHandled = true;

                        resolve(["INBOX"]);
                    });
            });
        },

        actionAddItem: function () {
            Espo.Ui.notify(' ... ');

            this.fetchFolders()
                .then(options => {
                    Espo.Ui.notify(false);

                    this.createView( 'addModal', this.addItemModalView, {options: options})
                        .then(view => {
                            view.render();

                            view.once('add', item =>{
                                this.addValue(item);

                                view.close();
                            });

                            view.once('add-mass', items => {
                                items.forEach(item => {
                                    this.addValue(item);
                                });

                                view.close();
                            });
                        });
                });
        },
    });
});

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

define('views/email-account/fields/folder', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        editTemplate: 'email-account/fields/folder/edit',

        getFoldersUrl: 'EmailAccount/action/getFolders',

        events: {
            'click [data-action="selectFolder"]': function () {
                Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

                var data = {
                    host: this.model.get('host'),
                    port: this.model.get('port'),
                    security: this.model.get('security'),
                    username: this.model.get('username'),
                    emailAddress: this.model.get('emailAddress'),
                    userId: this.model.get('assignedUserId'),
                };

                if (this.model.has('password')) {
                    data.password = this.model.get('password');
                }

                if (!this.model.isNew()) {
                    data.id = this.model.id;
                }

                Espo.Ajax.postRequest(this.getFoldersUrl, data).then(folders => {
                    this.createView('modal', 'views/email-account/modals/select-folder', {
                        folders: folders
                    }, view => {
                        Espo.Ui.notify(false);

                        view.render();

                        this.listenToOnce(view, 'select', (folder) => {
                            view.close();

                            this.addFolder(folder);
                        });
                    });
                })
                .catch(xhr => {
                    Espo.Ui.error(this.translate('couldNotConnectToImap', 'messages', 'EmailAccount'));

                    xhr.errorIsHandled = true;
                });
            }
        },

        addFolder: function (folder) {
            this.$element.val(folder);
        },
    });
});

define("helpers/misc/authentication-provider", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
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

  /** @module module:helpers/misc/authentication-provider */

  class _default {
    /**
     * @param {module:views/record/detail} view A view.
     */
    constructor(view) {
      /**
       * @private
       * @type {module:views/record/detail}
       */
      this.view = view;
      this.metadata = view.getMetadata();

      /**
       * @private
       * @type {module:model}
       */
      this.model = view.model;

      /** @var {Object.<string, Object.<string, *>>} defs */
      const defs = view.getMetadata().get(['authenticationMethods']) || {};

      /**
       * @private
       * @type {string[]}
       */
      this.methodList = Object.keys(defs).filter(item => {
        /** @var {Object.<string, *>} */
        const data = defs[item].provider || {};
        return data.isAvailable;
      });

      /** @private */
      this.authFields = {};

      /** @private */
      this.dynamicLogicDefs = {
        fields: {},
        panels: {}
      };
    }

    /**
     * @param {function(): void} callback
     */
    setupPanelsVisibility(callback) {
      this.handlePanelsVisibility(callback);
      this.view.listenTo(this.model, 'change:method', () => this.handlePanelsVisibility(callback));
    }

    /**
     * @private
     * @param {string} method
     * @param {string} param
     * @return {*}
     */
    getFromMetadata(method, param) {
      return this.metadata.get(['authenticationMethods', method, 'provider', param]) || this.metadata.get(['authenticationMethods', method, 'settings', param]);
    }

    /**
     * @return {Object}
     */
    setupMethods() {
      this.methodList.forEach(method => this.setupMethod(method));
      return this.dynamicLogicDefs;
    }

    /**
     * @private
     */
    setupMethod(method) {
      /** @var {string[]} */
      let fieldList = this.getFromMetadata(method, 'fieldList') || [];
      fieldList = fieldList.filter(item => this.model.hasField(item));
      this.authFields[method] = fieldList;
      const mDynamicLogicFieldsDefs = (this.getFromMetadata(method, 'dynamicLogic') || {}).fields || {};
      for (const f in mDynamicLogicFieldsDefs) {
        if (!fieldList.includes(f)) {
          continue;
        }
        const defs = this.modifyDynamicLogic(mDynamicLogicFieldsDefs[f]);
        this.dynamicLogicDefs.fields[f] = Espo.Utils.cloneDeep(defs);
      }
    }

    /**
     * @private
     */
    modifyDynamicLogic(defs) {
      defs = Espo.Utils.clone(defs);
      if (Array.isArray(defs)) {
        return defs.map(item => this.modifyDynamicLogic(item));
      }
      if (typeof defs === 'object') {
        const o = {};
        for (const property in defs) {
          let value = defs[property];
          if (property === 'attribute' && value === 'authenticationMethod') {
            value = 'method';
          }
          o[property] = this.modifyDynamicLogic(value);
        }
        return o;
      }
      return defs;
    }
    modifyDetailLayout(layout) {
      this.methodList.forEach(method => {
        let mLayout = this.getFromMetadata(method, 'layout');
        if (!mLayout) {
          return;
        }
        mLayout = Espo.Utils.cloneDeep(mLayout);
        mLayout.name = method;
        this.prepareLayout(mLayout, method);
        layout.push(mLayout);
      });
    }
    prepareLayout(layout, method) {
      layout.rows.forEach(row => {
        row.filter(item => !item.noLabel && !item.labelText && item.name).forEach(item => {
          if (item === null) {
            return;
          }
          const labelText = this.view.translate(item.name, 'fields', 'Settings');
          item.options = item.options || {};
          if (labelText && labelText.toLowerCase().indexOf(method.toLowerCase() + ' ') === 0) {
            item.labelText = labelText.substring(method.length + 1);
          }
          item.options.tooltipText = this.view.translate(item.name, 'tooltips', 'Settings');
        });
      });
      layout.rows = layout.rows.map(row => {
        row = row.map(cell => {
          if (cell && cell.name && !this.model.hasField(cell.name)) {
            return false;
          }
          return cell;
        });
        return row;
      });
    }

    /**
     * @private
     * @param {function(): void} callback
     */
    handlePanelsVisibility(callback) {
      const authenticationMethod = this.model.get('method');
      this.methodList.forEach(method => {
        const fieldList = this.authFields[method] || [];
        if (method !== authenticationMethod) {
          this.view.hidePanel(method);
          fieldList.forEach(field => {
            this.view.hideField(field);
          });
          return;
        }
        this.view.showPanel(method);
        fieldList.forEach(field => this.view.showField(field));
        callback();
      });
    }
  }
  _exports.default = _default;
});

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

define('views/settings/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        saveAndContinueEditingAction: false,

        sideView: null,

        layoutName: 'settings',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'after:save', () => {
                this.getConfig().set(this.model.getClonedAttributes());
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

        exit: function (after) {
            if (after === 'cancel') {
                this.getRouter().navigate('#Admin', {trigger: true});
            }
        },
    });
});


define("views/settings/edit", ["exports", "views/edit"], function (_exports, _edit) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _edit = _interopRequireDefault(_edit);
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

  class SettingsEditView extends _edit.default {
    scope = 'Settings';
    setupHeader() {
      this.createView('header', this.headerView, {
        model: this.model,
        fullSelector: '#main > .header',
        template: this.options.headerTemplate,
        label: this.options.label
      });
    }
  }
  var _default = SettingsEditView;
  _exports.default = _default;
});

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

define('views/templates/event/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getAcl().checkModel(this.model, 'edit')) {
                if (['Held', 'Not Held'].indexOf(this.model.get('status')) === -1) {
                    this.dropdownItemList.push({
                        'html': this.translate('Set Held', 'labels', this.scope),
                        'name': 'setHeld',
                    });

                    this.dropdownItemList.push({
                        'html': this.translate('Set Not Held', 'labels', this.scope),
                        'name': 'setNotHeld',
                    });
                }
            }
        },

        actionSetHeld: function () {
            this.model
                .save({status: 'Held'}, {patch: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved', 'labels', 'Meeting'));

                    this.removeButton('setHeld');
                    this.removeButton('setNotHeld');
                });
        },

        actionSetNotHeld: function () {
            this.model
                .save({status: 'Not Held'}, {patch: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved', 'labels', 'Meeting'));

                    this.removeButton('setHeld');
                    this.removeButton('setNotHeld');
                });
        },
    });
});

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

define('views/scheduled-job/list', ['views/list'], function (Dep) {

    return Dep.extend({

        searchPanel: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.menu.buttons.push({
                link: '#Admin/jobs',
                text: this.translate('Jobs', 'labels', 'Admin'),
            });

            this.createView('search', 'views/base', {
                fullSelector: '#main > .search-container',
                template: 'scheduled-job/cronjob',
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            Espo.Ajax
                .getRequest('Admin/action/cronMessage')
                .then(data => {
                    this.$el.find('.cronjob .message').html(data.message);
                    this.$el.find('.cronjob .command').html('<strong>' + data.command + '</strong>');
                });
        },

        getHeader: function () {
            return this.buildHeaderHtml([
                $('<a>')
                    .attr('href', '#Admin')
                    .text(this.translate('Administration', 'labels', 'Admin')),
                this.getLanguage().translate(this.scope, 'scopeNamesPlural')
            ]);
        },
    });
});

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

define('views/scheduled-job/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

    	quickDetailDisabled: true,

        quickEditDisabled: true,

        massActionList: ['remove', 'massUpdate'],

    });
});

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

define('views/scheduled-job/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: false,
    });
});

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

define('views/scheduled-job/record/panels/log', ['views/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        setupListLayout: function () {
            var jobWithTargetList = this.getMetadata().get(['clientDefs', 'ScheduledJob', 'jobWithTargetList']) || [];

            if (~jobWithTargetList.indexOf(this.model.get('job'))) {
                this.listLayoutName = 'listSmallWithTarget'
            }
        },
    });
});

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

define('views/scheduled-job/fields/scheduling', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.isEditMode() || this.isDetailMode()) {
                this.wait(
                    Espo.loader.requirePromise('lib!cronstrue')
                        .then(Cronstrue => {
                            this.Cronstrue = Cronstrue;

                            this.listenTo(this.model, 'change:' + this.name, () => this.showText());
                        })
                );
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.isEditMode() || this.isDetailMode()) {
                let $text = this.$text = $('<div class="small text-success"/>');

                this.$el.append($text);
                this.showText();
            }
        },

        showText: function () {
            if (!this.$text || !this.$text.length) {
                return;
            }

            if (!this.Cronstrue) {
                return;
            }

            var exp = this.model.get(this.name);

            if (!exp) {
                this.$text.text('');

                return;
            }

            if (exp === '* * * * *') {
                this.$text.text(this.translate('As often as possible', 'labels', 'ScheduledJob'));

                return;
            }

            var locale = 'en';
            var localeList = Object.keys(this.Cronstrue.default.locales);
            var language = this.getLanguage().name;

            if (~localeList.indexOf(language)) {
                locale = language;
            }
            else if (~localeList.indexOf(language.split('_')[0])) {
                locale = language.split('_')[0];
            }

            try {
                var text = this.Cronstrue.toString(exp, {
                    use24HourTimeFormat: !this.getDateTime().hasMeridian(),
                    locale: locale,
                });

            }
            catch (e) {
                text = this.translate('Not valid');
            }

            this.$text.text(text);
        },
    });
});

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

define('views/scheduled-job/fields/job', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.isEditMode() || this.isDetailMode()) {
                this.wait(true);

                Espo.Ajax
                    .getRequest('Admin/jobs')
                    .then(data => {
                        this.params.options = data.filter(item => {
                            return !this.getMetadata().get(['entityDefs', 'ScheduledJob', 'jobs', item, 'isSystem']);
                        });

                        this.params.options.unshift('');

                        this.wait(false);
                    });
            }

            if (this.model.isNew()) {
                this.on('change', () => {
                    var job = this.model.get('job');

                    if (job) {
                        var label = this.getLanguage().translateOption(job, 'job', 'ScheduledJob');
                        var scheduling = this.getMetadata().get('entityDefs.ScheduledJob.jobSchedulingMap.' + job) ||
                            '*/10 * * * *';

                        this.model.set('name', label);
                        this.model.set('scheduling', scheduling);

                        return;
                    }

                    this.model.set('name', '');
                    this.model.set('scheduling', '');
                });
            }
        },
    });
});

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

define('views/role/list', ['views/list'], function (Dep) {

    return Dep.extend({

        searchPanel: false,
    });
});

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

define('views/role/record/detail-side', ['views/record/detail-side'], function (Dep) {

    return Dep.extend({

        panelList: [
            {
                name: 'default',
                label: false,
                view: 'views/role/record/panels/side',
            }
        ],
    });
});

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

define('views/role/record/panels/side', ['views/record/panels/side'], function (Dep) {

    return Dep.extend({

        template: 'role/record/panels/side',

    });
});


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

define('views/role/modals/add-field', ['views/modal'], function (Dep) {

    return Dep.extend({

        template: 'role/modals/add-field',

        events: {
            'click a[data-action="addField"]': function (e) {
                this.trigger('add-field', $(e.currentTarget).data().name);
            }
        },

        data: function () {
            var dataList = [];

            this.fieldList.forEach((field, i) => {
                if (i % 4 === 0) {
                    dataList.push([]);
                }

                dataList[dataList.length -1].push(field);
            });

            return {
                dataList: dataList,
                scope: this.scope
            };
        },

        setup: function () {
            this.headerText = this.translate('Add Field');

            var scope = this.scope = this.options.scope;
            var fields = this.getMetadata().get('entityDefs.' + scope + '.fields') || {};
            var fieldList = [];

            Object.keys(fields).forEach(field => {
                var d = fields[field];

                if (field in this.options.ignoreFieldList) {
                    return;
                }

                if (d.disabled) {
                    return;
                }

                if (
                    this.getMetadata()
                        .get(['app', this.options.type, 'mandatory', 'scopeFieldLevel', this.scope, field]) !== null
                ) {
                    return;
                }

                fieldList.push(field);
            });

            this.fieldList = this.getLanguage().sortFieldList(scope, fieldList);
        },
    });
});

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

define('views/portal-role/list', ['views/list'], function (Dep) {

    return Dep.extend({

        searchPanel: false,
    });
});

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

define('views/portal-role/record/table', ['views/role/record/table'], function (Dep) {

    return Dep.extend({

        levelListMap: {
            'recordAllAccountContactOwnNo': ['all', 'account', 'contact', 'own', 'no'],
            'recordAllAccountOwnNo': ['all', 'account', 'own', 'no'],
            'recordAllContactOwnNo': ['all', 'contact', 'own', 'no'],
            'recordAllAccountNo': ['all', 'account', 'no'],
            'recordAllContactNo': ['all', 'contact', 'no'],
            'recordAllAccountContactNo': ['all', 'account', 'contact', 'no'],
            'recordAllOwnNo': ['all', 'own', 'no'],
            'recordAllNo': ['all', 'no'],
            'record': ['all', 'own', 'no']
        },

        levelList: [
            'all',
            'account',
            'contact',
            'own',
            'no',
        ],

        type: 'aclPortal',

        lowestLevelByDefault: true,

        setupScopeList: function () {
            this.aclTypeMap = {};
            this.scopeList = [];

            var scopeListAll = Object.keys(this.getMetadata().get('scopes'))
                .sort((v1, v2) => {
                     return this.translate(v1, 'scopeNamesPlural')
                         .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            scopeListAll.forEach(scope => {
                if (
                    this.getMetadata().get('scopes.' + scope + '.disabled') ||
                    this.getMetadata().get('scopes.' + scope + '.disabledPortal')
                ) {
                    return;
                }

                var acl = this.getMetadata().get('scopes.' + scope + '.aclPortal');

                if (acl) {
                    this.scopeList.push(scope);
                    this.aclTypeMap[scope] = acl;

                    if (acl === true) {
                        this.aclTypeMap[scope] = 'record';
                    }
                }
            });
        },
    });
});

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

define('views/portal-role/record/list', ['views/role/record/list'], function (Dep) {

    return Dep.extend({});
});

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

define('views/portal-role/record/edit', ['views/role/record/edit'], function (Dep) {

    return Dep.extend({

        tableView: 'views/portal-role/record/table',

        stickButtonsContainerAllTheWay: true,
    });
});

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

define('views/portal-role/record/detail', ['views/role/record/detail'], function (Dep) {

    return Dep.extend({

        tableView: 'views/portal-role/record/table',

        stickButtonsContainerAllTheWay: true,
    });
});

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

define('views/lead-capture-log-record/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

       editDisabled: true,

       fullFormDisabled: true,

    });
});

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

define('views/lead-capture/opt-in-confirmation-success', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'lead-capture/opt-in-confirmation-success',

        setup: function () {
            let model = new Model();

            this.resultData = this.options.resultData;

            if (this.resultData.message) {
                model.set('message', this.resultData.message);

                this.createView('messageField', 'views/fields/text', {
                    selector: '.field[data-name="message"]',
                    mode: 'detail',
                    inlineEditDisabled: true,
                    model: model,
                    name: 'message',
                });
            }
        },

        data: function () {
            return {
                resultData: this.options.resultData,
                defaultMessage: this.getLanguage().translate('optInIsConfirmed', 'messages', 'LeadCapture'),
            };
        },
    });
});

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

define('views/lead-capture/opt-in-confirmation-expired', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'lead-capture/opt-in-confirmation-expired',

        setup: function () {
            this.resultData = this.options.resultData;
        },

        data: function () {
            return {
                defaultMessage: this.getLanguage().translate('optInConfirmationExpired', 'messages', 'LeadCapture'),
            };
        },
    });
});

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

define('views/lead-capture/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: ['remove', 'massUpdate', 'export'],

    });
});

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

define('views/lead-capture/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        setupActionItems: function () {
            Dep.prototype.setupActionItems.call(this);

            this.dropdownItemList.push({
                'label': 'Generate New API Key',
                'name': 'generateNewApiKey',
            });
        },

        actionGenerateNewApiKey: function () {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax.postRequest('LeadCapture/action/generateNewApiKey', {id: this.model.id})
                    .then(data => {
                        this.model.set(data);
                    });
            });
        },
    });
});

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

define('views/lead-capture/record/panels/request', ['views/record/panels/side'], function (Dep) {

    return Dep.extend({

        fieldList: [
            'exampleRequestUrl',
            'exampleRequestMethod',
            'exampleRequestHeaders',
            'exampleRequestPayload'
        ],
    });
});

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

define('views/lead-capture/fields/smtp-account', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        dataUrl: 'LeadCapture/action/smtpAccountDataList',

        getAttributeList: function () {
            return [this.name, 'inboundEmailId'];
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            data.valueIsSet = true;
            data.isNotEmpty = true;

            return data;
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = [];
            this.translatedOptions = {};

            this.params.options.push('system');

            if (!this.loadedOptionList) {
                if (this.model.get('inboundEmailId')) {
                    var item = 'inboundEmail:' + this.model.get('inboundEmailId');

                    this.params.options.push(item);

                    this.translatedOptions[item] =
                        (this.model.get('inboundEmailName') || this.model.get('inboundEmailId')) +
                        ' (' + this.translate('group', 'labels', 'MassEmail') + ')';
                }
            } else {
                this.loadedOptionList.forEach((item) => {
                    this.params.options.push(item);

                    this.translatedOptions[item] =
                        (this.loadedOptionTranslations[item] || item) +
                        ' (' + this.translate('group', 'labels', 'MassEmail') + ')';
                });
            }

            this.translatedOptions['system'] =
                this.getConfig().get('outboundEmailFromAddress') +
                ' (' + this.translate('system', 'labels', 'MassEmail') + ')';
        },

        getValueForDisplay: function () {
            if (!this.model.has(this.name) && this.isReadMode()) {
                if (this.model.has('inboundEmailId')) {
                    if (this.model.get('inboundEmailId')) {
                        return 'inboundEmail:' + this.model.get('inboundEmailId');
                    } else {
                        return 'system';
                    }
                } else {
                    return '...';
                }
            }

            return this.model.get(this.name);
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            if (
                this.getAcl().checkScope('MassEmail', 'create') ||
                this.getAcl().checkScope('MassEmail', 'edit')
            ) {

                Espo.Ajax.getRequest(this.dataUrl).then(dataList => {
                    if (!dataList.length) {
                        return;
                    }

                    this.loadedOptionList = [];

                    this.loadedOptionTranslations = {};
                    this.loadedOptionAddresses = {};
                    this.loadedOptionFromNames = {};

                    dataList.forEach(item => {
                        this.loadedOptionList.push(item.key);

                        this.loadedOptionTranslations[item.key] = item.emailAddress;
                        this.loadedOptionAddresses[item.key] = item.emailAddress;
                        this.loadedOptionFromNames[item.key] = item.fromName || '';
                    });

                    this.setupOptions();
                    this.reRender();
                });
            }
        },

        fetch: function () {
            var data = {};
            var value = this.$element.val();

            data[this.name] = value;

            if (!value || value === 'system') {
                data.inboundEmailId = null;
                data.inboundEmailName = null;
            }
            else {
                var arr = value.split(':');

                if (arr.length > 1) {
                    data.inboundEmailId = arr[1];
                    data.inboundEmailName = this.translatedOptions[data.inboundEmailId] || data.inboundEmailId;
                }
            }

            return data;
        },
    });
});

define("views/lead-capture/fields/phone-number-country", ["exports", "views/fields/enum", "intl-tel-input-globals"], function (_exports, _enum, _intlTelInputGlobals) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _enum = _interopRequireDefault(_enum);
  _intlTelInputGlobals = _interopRequireDefault(_intlTelInputGlobals);
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

  // noinspection NpmUsedModulesInstalled

  class LeadCapturePhoneNumberCountry extends _enum.default {
    setupOptions() {
      this.params.options = ['', ..._intlTelInputGlobals.default.getCountryData().map(item => item.iso2)];
      this.translatedOptions = _intlTelInputGlobals.default.getCountryData().reduce((map, item) => {
        map[item.iso2] = `${item.iso2.toUpperCase()} +${item.dialCode}`;
        return map;
      }, {});
    }
  }
  var _default = LeadCapturePhoneNumberCountry;
  _exports.default = _default;
});

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

define('views/lead-capture/fields/field-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = [];
            this.translatedOptions = {};

            var fields = this.getMetadata()
                .get(['entityDefs', 'Lead', 'fields']) || {};

            var ignoreFieldList = this.getMetadata()
                .get(['entityDefs', 'LeadCapture', 'fields', 'fieldList', 'ignoreFieldList']) || [];

            for (let field in fields) {
                var defs = fields[field];

                if (defs.disabled) {
                    continue;
                }

                if (defs.readOnly) {
                    continue;
                }

                if (~ignoreFieldList.indexOf(field)) {
                    continue;
                }

                this.params.options.push(field);
                this.translatedOptions[field] = this.translate(field, 'fields', 'Lead');
            }
        }
    });
});

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

define('views/lead-capture/fields/api-key', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({
    });
});

define("views/layout-set/layouts", ["exports", "views/admin/layouts/index"], function (_exports, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _index = _interopRequireDefault(_index);
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

  class LayoutsView extends _index.default {
    setup() {
      let setId = this.setId = this.options.layoutSetId;
      this.baseUrl = '#LayoutSet/editLayouts/id=' + setId;
      super.setup();
      this.wait(this.getModelFactory().create('LayoutSet').then(m => {
        this.sModel = m;
        m.id = setId;
        return m.fetch();
      }));
    }
    getLayoutScopeDataList() {
      let dataList = [];
      let list = this.sModel.get('layoutList') || [];
      let scopeList = [];
      list.forEach(item => {
        let arr = item.split('.');
        let scope = arr[0];
        if (~scopeList.indexOf(scope)) {
          return;
        }
        scopeList.push(scope);
      });
      scopeList.forEach(scope => {
        let o = {};
        o.scope = scope;
        o.url = this.baseUrl + '&scope=' + scope;
        o.typeDataList = [];
        let typeList = [];
        list.forEach(item => {
          let [scope, type] = item.split('.');
          if (scope !== o.scope) {
            return;
          }
          typeList.push(type);
        });
        typeList.forEach(type => {
          o.typeDataList.push({
            type: type,
            url: this.baseUrl + '&scope=' + scope + '&type=' + type,
            label: this.translateLayoutName(type, scope)
          });
        });
        o.typeList = typeList;
        dataList.push(o);
      });
      return dataList;
    }
    getHeaderHtml() {
      const separatorHtml = ' <span class="breadcrumb-separator"><span class="chevron-right"></span></span> ';
      return $('<span>').append($('<a>').attr('href', '#LayoutSet').text(this.translate('LayoutSet', 'scopeNamesPlural')), separatorHtml, $('<a>').attr('href', '#LayoutSet/view/' + this.sModel.id).text(this.sModel.get('name')), separatorHtml, $('<span>').text(this.translate('Edit Layouts', 'labels', 'LayoutSet'))).get(0).outerHTML;
    }
    navigate(scope, type) {
      let url = '#LayoutSet/editLayouts/id=' + this.setId + '&scope=' + scope + '&type=' + type;
      this.getRouter().navigate(url, {
        trigger: false
      });
    }
  }
  var _default = LayoutsView;
  _exports.default = _default;
});

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

define('views/layout-set/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: [
            'remove',
            'export',
        ],
    });
});

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

define('views/layout-set/fields/layout-list', [
    'views/fields/multi-enum', 'views/admin/layouts/index'], function (Dep, LayoutsIndex) {

    return Dep.extend({

        typeList: [
            'list',
            'detail',
            'listSmall',
            'detailSmall',
            'bottomPanelsDetail',
            'filters',
            'massUpdate',
            'sidePanelsDetail',
            'sidePanelsEdit',
            'sidePanelsDetailSmall',
            'sidePanelsEditSmall',
        ],

        setupOptions: function () {
            this.params.options = [];
            this.translatedOptions = {};

            this.scopeList = Object.keys(this.getMetadata().get('scopes'))
                .filter(item => {
                    return this.getMetadata().get(['scopes', item, 'layouts']);
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNames')
                        .localeCompare(this.translate(v2, 'scopeNames'));
                });

            let dataList = LayoutsIndex.prototype.getLayoutScopeDataList.call(this);

            dataList.forEach(item1 => {
                item1.typeList.forEach(type => {
                    let item = item1.scope + '.' + type;

                    if (type.substr(-6) === 'Portal') {
                        return;
                    }

                    this.params.options.push(item);

                    this.translatedOptions[item] = this.translate(item1.scope, 'scopeNames') + '.' +
                        this.translate(type, 'layouts', 'Admin');
                });
            });
        },

        translateLayoutName: function (type, scope) {
            return LayoutsIndex.prototype.translateLayoutName.call(this, type, scope);
        },
    });
});

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

define('views/layout-set/fields/edit', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        detailTemplateContent:
            "<a class=\"btn btn-default\" href=\"#LayoutSet/editLayouts/id={{model.id}}\">" +
            "{{translate 'Edit Layouts' scope='LayoutSet'}}</a>",

        editTemplateContent: '',

    });
});

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

define('views/inbound-email/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

    	quickDetailDisabled: true,
        quickEditDisabled: true,
        massActionList: ['remove', 'massUpdate'],
        checkAllResultDisabled: true,
    });
});

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

define('views/inbound-email/record/edit', ['views/record/edit', 'views/inbound-email/record/detail'],
function (Dep, Detail) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            Detail.prototype.setupFieldsBehaviour.call(this);
            Detail.prototype.initSslFieldListening.call(this);

            if (Detail.prototype.wasFetched.call(this)) {
                this.setFieldReadOnly('fetchSince');
            }
        },

        modifyDetailLayout: function (layout) {
            Detail.prototype.modifyDetailLayout.call(this, layout);
        },

        controlStatusField: function () {
            Detail.prototype.controlStatusField.call(this);
        },

        initSmtpFieldsControl: function () {
            Detail.prototype.initSmtpFieldsControl.call(this);
        },

        controlSmtpFields: function () {
            Detail.prototype.controlSmtpFields.call(this);
        },

        controlSentFolderField: function () {
            Detail.prototype.controlSentFolderField.call(this);
        },

        controlSmtpAuthField: function () {
            Detail.prototype.controlSmtpAuthField.call(this);
        },

        wasFetched: function () {
            Detail.prototype.wasFetched.call(this);
        },
    });
});

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

define('views/inbound-email/fields/test-send', ['views/email-account/fields/test-send'], function (Dep) {

    return Dep.extend({

        getSmtpData: function () {
            return {
                'server': this.model.get('smtpHost'),
                'port': this.model.get('smtpPort'),
                'auth': this.model.get('smtpAuth'),
                'security': this.model.get('smtpSecurity'),
                'username': this.model.get('smtpUsername'),
                'password': this.model.get('smtpPassword') || null,
                'authMechanism': this.model.get('smtpAuthMechanism'),
                'fromName': this.model.get('fromName'),
                'fromAddress': this.model.get('emailAddress'),
                'type': 'inboundEmail',
                'id': this.model.id,
            };
        },
     });
});

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

define('views/inbound-email/fields/test-connection', ['views/email-account/fields/test-connection'], function (Dep) {

    return Dep.extend({

        url: 'InboundEmail/action/testConnection',
     });
});

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

define('views/inbound-email/fields/target-user-position', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.translatedOptions = {
                '': '--' + this.translate('All') + '--'
            };

            this.params.options = [''];

            if (this.model.get('targetUserPosition') && this.model.get('teamId')) {
                this.params.options.push(this.model.get('targetUserPosition'));
            }

            this.loadRoleList(() => {
                if (this.mode === 'edit') {
                    if (this.isRendered()) {
                        this.render();
                    }
                }
            });

            this.listenTo(this.model, 'change:teamId', () => {
                this.loadRoleList(() => {
                    this.render();
                });
            });
        },

        loadRoleList: function (callback, context) {
            var teamId = this.model.get('teamId');

            if (!teamId) {
                this.params.options = [''];
            }

            this.getModelFactory().create('Team', (team) => {
                team.id = teamId;

                this.listenToOnce(team, 'sync', () => {
                    this.params.options = team.get('positionList') || [];
                    this.params.options.unshift('');

                    callback.call(context);
                });

                team.fetch();
            });
        },
    });
});

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

define('views/inbound-email/fields/folders', ['views/email-account/fields/folders'], function (Dep) {

    return Dep.extend({

        getFoldersUrl: 'InboundEmail/action/getFolders',

    });
});

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

define('views/inbound-email/fields/folder', ['views/email-account/fields/folder'], function (Dep) {

    return Dep.extend({

        getFoldersUrl: 'InboundEmail/action/getFolders',

    });
});

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

define('views/inbound-email/fields/email-address', ['views/fields/email-address'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.on('change', () => {
                var emailAddress = this.model.get('emailAddress');

                this.model.set('name', emailAddress);

                if (this.model.isNew() || !this.model.get('replyToAddress')) {
                    this.model.set('replyToAddress', emailAddress);
                }
            });
        },
    });
});

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

define('views/authentication-provider/record/edit', ['views/record/edit', 'helpers/misc/authentication-provider'],
function (Dep, Helper) {

    return Dep.extend({

        saveAndNewAction: false,

        /**
         * @private
         * @type {module:helpers/misc/authentication-provider}
         */
        helper: null,

        setup: function () {
            this.helper = new Helper(this);

            Dep.prototype.setup.call(this);
        },

        setupBeforeFinal: function () {
            this.dynamicLogicDefs = this.helper.setupMethods();

            Dep.prototype.setupBeforeFinal.call(this);

            this.helper.setupPanelsVisibility(() => {
                this.processDynamicLogic();
            });
        },

        modifyDetailLayout: function (layout) {
            this.helper.modifyDetailLayout(layout);
        },
    });
});

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

define('views/authentication-provider/record/detail', ['views/record/detail', 'helpers/misc/authentication-provider'],
function (Dep, Helper) {

    return Dep.extend({

        editModeDisabled: true,

        /**
         * @private
         * @type {module:helpers/misc/authentication-provider.Class}
         */
        helper: null,

        setup: function () {
            this.helper = new Helper(this);

            Dep.prototype.setup.call(this);
        },

        setupBeforeFinal: function () {
            this.dynamicLogicDefs = this.helper.setupMethods();

            Dep.prototype.setupBeforeFinal.call(this);

            this.helper.setupPanelsVisibility(() => {
                this.processDynamicLogic();
            });
        },

        modifyDetailLayout: function (layout) {
            this.helper.modifyDetailLayout(layout);
        },
    });
});

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

define('views/authentication-provider/fields/method', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            /** @var {Object.<string, Object.<string, *>>} defs */
            let defs = this.getMetadata().get(['authenticationMethods']) || {};

            let options = Object.keys(defs)
                .filter(item => {
                    /** @var {Object.<string, *>} */
                    let data = defs[item].provider || {};

                    return data.isAvailable;
                });

            options.unshift('');

            this.params.options = options;
        },
    });
});

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

define('views/admin/user-interface', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'userInterface',

        saveAndContinueEditingAction: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.controlColorsField();
            this.listenTo(this.model, 'change:scopeColorsDisabled', this.controlColorsField, this);

            this.on('save', (initialAttributes) => {
                if (
                    this.model.get('theme') !== initialAttributes.theme ||
                    (this.model.get('themeParams').navbar || {}) !== (initialAttributes.themeParams).navbar
                ) {
                    this.setConfirmLeaveOut(false);

                    window.location.reload();
                }
            });
        },

        controlColorsField: function () {
            if (this.model.get('scopeColorsDisabled')) {
                this.hideField('tabColorsDisabled');
            } else {
                this.showField('tabColorsDisabled');
            }
        },
    });
});

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

define('views/admin/sms', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'sms',
    });
});

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

define('views/admin/settings', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'settings',

        saveAndContinueEditingAction: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getHelper().getAppParam('isRestrictedMode') && !this.getUser().isSuperAdmin()) {
                this.hideField('cronDisabled');
                this.hideField('maintenanceMode');
                this.setFieldReadOnly('useWebSocket');
                this.setFieldReadOnly('siteUrl');
            }
        },
    });
});

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

define('views/admin/outbound-emails', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'outboundEmails',

        saveAndContinueEditingAction: false,

        dynamicLogicDefs: {
            fields: {
                smtpUsername: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                            {
                                type: 'isTrue',
                                attribute: 'smtpAuth',
                            }
                        ]
                    },
                    required: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                            {
                                type: 'isTrue',
                                attribute: 'smtpAuth',
                            }
                        ]
                    }
                },
                smtpPassword: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                            {
                                type: 'isTrue',
                                attribute: 'smtpAuth',
                            }
                        ]
                    }
                },
                smtpPort: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                        ]
                    },
                    required: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                        ]
                    }
                },
                smtpSecurity: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                        ]
                    }
                },
                smtpAuth: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isNotEmpty',
                                attribute: 'smtpServer',
                            },
                        ]
                    }
                },
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            var smtpSecurityField = this.getFieldView('smtpSecurity');
            this.listenTo(smtpSecurityField, 'change', function () {
                var smtpSecurity = smtpSecurityField.fetch()['smtpSecurity'];
                if (smtpSecurity == 'SSL') {
                    this.model.set('smtpPort', '465');
                } else if (smtpSecurity == 'TLS') {
                    this.model.set('smtpPort', '587');
                } else {
                    this.model.set('smtpPort', '25');
                }
            }.bind(this));
        },

    });

});


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

define('views/admin/notifications', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'notifications',

        saveAndContinueEditingAction: false,

        dynamicLogicDefs: {
            fields: {
                assignmentEmailNotificationsEntityList: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'assignmentEmailNotifications',
                            }
                        ],
                    },
                },
                adminNotificationsNewVersion: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'adminNotifications',
                            }
                        ],
                    },
                },
                adminNotificationsNewExtensionVersion: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'adminNotifications',
                            }
                        ],
                    },
                },
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.controlStreamEmailNotificationsEntityList();
            this.listenTo(this.model, 'change', function (model) {
                if (model.hasChanged('streamEmailNotifications') || model.hasChanged('portalStreamEmailNotifications')) {
                    this.controlStreamEmailNotificationsEntityList();
                }
            }, this);
        },

        controlStreamEmailNotificationsEntityList: function () {
            if (this.model.get('streamEmailNotifications') || this.model.get('portalStreamEmailNotifications')) {
                this.showField('streamEmailNotificationsEntityList');
                this.showField('streamEmailNotificationsTypeList');
            } else {
                this.hideField('streamEmailNotificationsEntityList');
                this.hideField('streamEmailNotificationsTypeList');
            }
        }

    });
});

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

define('views/admin/jobs-settings', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'jobsSettings',

        saveAndContinueEditingAction: false,

        dynamicLogicDefs: {
            fields: {
                jobPoolConcurrencyNumber: {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'jobRunInParallel'
                            }
                        ]
                    }
                }
            }
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getHelper().getAppParam('isRestrictedMode') && !this.getUser().isSuperAdmin()) {

                this.setFieldReadOnly('jobRunInParallel');
                this.setFieldReadOnly('jobMaxPortion');
                this.setFieldReadOnly('jobPoolConcurrencyNumber');
                this.setFieldReadOnly('daemonInterval');
                this.setFieldReadOnly('daemonMaxProcessNumber');
                this.setFieldReadOnly('daemonProcessTimeout');
            }
        },

    });
});

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

define('views/admin/inbound-emails', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'inboundEmails',

        saveAndContinueEditingAction: false,

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

    });
});

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

define('views/admin/currency', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'currency',

        saveAndContinueEditingAction: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:currencyList', function (model, value, o) {
                if (!o.ui) {
                    return;
                }

                var currencyList = Espo.Utils.clone(model.get('currencyList'));

                this.setFieldOptionList('defaultCurrency', currencyList);
                this.setFieldOptionList('baseCurrency', currencyList);

                this.controlCurrencyRatesVisibility();
            }, this);

            this.listenTo(this.model, 'change', function (model, o) {
                if (!o.ui) {
                    return;
                }

                if (model.hasChanged('currencyList') || model.hasChanged('baseCurrency')) {
                    var currencyRatesField = this.getFieldView('currencyRates');

                    if (currencyRatesField) {
                        currencyRatesField.reRender();
                    }
                }
            }, this);

            this.controlCurrencyRatesVisibility();
        },

        controlCurrencyRatesVisibility: function () {
            var currencyList = this.model.get('currencyList');

            if (currencyList.length < 2) {
                this.hideField('currencyRates');
            } else {
                this.showField('currencyRates');
            }
        },

    });
});

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

define('views/admin/authentication', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        layoutName: 'authentication',

        saveAndContinueEditingAction: false,

        setup: function () {
            this.methodList = [];

            let defs = this.getMetadata().get(['authenticationMethods']) || {};

            for (let method in defs) {
                if (defs[method].settings && defs[method].settings.isAvailable) {
                    this.methodList.push(method);
                }
            }

            this.authFields = {};

            Dep.prototype.setup.call(this);

            this.handlePanelsVisibility();

            this.listenTo(this.model, 'change:authenticationMethod', () => {
                this.handlePanelsVisibility();
            });

            this.manage2FAFields();

            this.listenTo(this.model, 'change:auth2FA', () => {
                this.manage2FAFields();
            });

            this.managePasswordRecoveryFields();

            this.listenTo(this.model, 'change:passwordRecoveryDisabled', () => {
                this.managePasswordRecoveryFields();
            });
        },

        setupBeforeFinal: function () {
            this.dynamicLogicDefs = {
                fields: {},
                panels: {},
            };

            this.methodList.forEach(method => {
                let fieldList = this.getMetadata().get(['authenticationMethods', method, 'settings', 'fieldList']);

                if (fieldList) {
                    this.authFields[method] = fieldList;
                }

                let mDynamicLogicFieldsDefs = this.getMetadata()
                    .get(['authenticationMethods', method, 'settings', 'dynamicLogic', 'fields']);

                if (mDynamicLogicFieldsDefs) {
                    for (let f in mDynamicLogicFieldsDefs) {
                        this.dynamicLogicDefs.fields[f] = Espo.Utils.cloneDeep(mDynamicLogicFieldsDefs[f]);
                    }
                }
            });

            Dep.prototype.setupBeforeFinal.call(this);
        },

        modifyDetailLayout: function (layout) {
            this.methodList.forEach(method => {
                let mLayout = this.getMetadata().get(['authenticationMethods', method, 'settings', 'layout']);

                if (!mLayout) {
                    return;
                }

                mLayout = Espo.Utils.cloneDeep(mLayout);
                mLayout.name = method;

                this.prepareLayout(mLayout, method);

                layout.push(mLayout);
            });
        },

        prepareLayout: function (layout, method) {
            layout.rows.forEach(row => {
                row
                    .filter(item => !item.noLabel && !item.labelText && item.name)
                    .forEach(item => {
                        let labelText = this.translate(item.name, 'fields', 'Settings');

                        if (labelText && labelText.toLowerCase().indexOf(method.toLowerCase() + ' ') === 0) {
                            item.labelText = labelText.substring(method.length + 1);
                        }
                    });
            });
        },

        handlePanelsVisibility: function () {
            var authenticationMethod = this.model.get('authenticationMethod');

            this.methodList.forEach(method => {
                var fieldList = (this.authFields[method] || []);

                if (method !== authenticationMethod) {
                    this.hidePanel(method);

                    fieldList.forEach(field => {
                        this.hideField(field);
                    });

                    return;
                }

                this.showPanel(method);

                fieldList.forEach(field => {
                    this.showField(field);
                });

                this.processDynamicLogic();
            });
        },

        manage2FAFields: function () {
            if (this.model.get('auth2FA')) {
                this.showField('auth2FAForced');
                this.showField('auth2FAMethodList');
                this.showField('auth2FAInPortal');
                this.setFieldRequired('auth2FAMethodList');

                return;
            }

            this.hideField('auth2FAForced');
            this.hideField('auth2FAMethodList');
            this.hideField('auth2FAInPortal');
            this.setFieldNotRequired('auth2FAMethodList');
        },

        managePasswordRecoveryFields: function () {
            if (!this.model.get('passwordRecoveryDisabled')) {
                this.showField('passwordRecoveryForAdminDisabled');
                this.showField('passwordRecoveryForInternalUsersDisabled');
                this.showField('passwordRecoveryNoExposure');

                return;
            }

            this.hideField('passwordRecoveryForAdminDisabled');
            this.hideField('passwordRecoveryForInternalUsersDisabled');
            this.hideField('passwordRecoveryNoExposure');
        },
    });
});

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

define('views/admin/upgrade/ready', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'ready-modal',

        header: false,

        template: 'admin/upgrade/ready',

        createButton: true,

        data: function () {
            return {
                version: this.upgradeData.version,
                text: this.translate('upgradeVersion', 'messages', 'Admin')
                    .replace('{version}', this.upgradeData.version)
            };
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'run',
                    label: this.translate('Run Upgrade', 'labels', 'Admin'),
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.upgradeData = this.options.upgradeData;

            this.header = this.getLanguage().translate('Ready for upgrade', 'labels', 'Admin');

        },

        actionRun: function () {
            this.trigger('run');
            this.remove();
        },
    });
});

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

define('views/admin/upgrade/index', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/upgrade/index',

        packageContents: null,

        data: function () {
            return {
                versionMsg: this.translate('Current version') + ': ' + this.getConfig().get('version'),
                infoMsg: this.translate('upgradeInfo', 'messages', 'Admin')
                    .replace('{url}', 'https://www.espocrm.com/documentation/administration/upgrading/'),
                backupsMsg: this.translate('upgradeBackup', 'messages', 'Admin'),
                upgradeRecommendation: this.translate('upgradeRecommendation', 'messages', 'Admin'),
                downloadMsg: this.translate('downloadUpgradePackage', 'messages', 'Admin')
                    .replace('{url}', 'https://www.espocrm.com/download/upgrades'),
            };
        },

        afterRender: function () {
            this.$el.find('.panel-body a').attr('target', '_BLANK');
        },

        events: {
            'change input[name="package"]': function (e) {
                this.$el.find('button[data-action="upload"]')
                    .addClass('disabled')
                    .attr('disabled', 'disabled');

                this.$el.find('.message-container').html('');

                var files = e.currentTarget.files;

                if (files.length) {
                    this.selectFile(files[0]);
                }
            },
            'click button[data-action="upload"]': function () {
                this.upload();
            },
        },

        setup: function () {
        },

        selectFile: function (file) {
            var fileReader = new FileReader();

            fileReader.onload = (e) => {
                this.packageContents = e.target.result;

                this.$el.find('button[data-action="upload"]')
                    .removeClass('disabled')
                    .removeAttr('disabled');
            };

            fileReader.readAsDataURL(file);
        },

        showError: function (msg) {
            msg = this.translate(msg, 'errors', 'Admin');

            this.$el.find('.message-container').html(msg);
        },

        upload: function () {
            this.$el.find('button[data-action="upload"]')
                .addClass('disabled')
                .attr('disabled', 'disabled');

            this.notify('Uploading...');

            Espo.Ajax
                .postRequest('Admin/action/uploadUpgradePackage', this.packageContents, {
                    contentType: 'application/zip',
                    timeout: 0,
                })
                .then(data => {
                    if (!data.id) {
                        this.showError(this.translate('Error occurred'));

                        return;
                    }

                    Espo.Ui.notify(false);

                    this.createView('popup', 'views/admin/upgrade/ready', {
                        upgradeData: data,
                    }, view => {
                        view.render();

                        this.$el.find('button[data-action="upload"]')
                            .removeClass('disabled')
                            .removeAttr('disabled');

                        view.once('run', () => {
                            view.close();

                            this.$el.find('.panel.upload').addClass('hidden');

                            this.run(data.id, data.version);
                        });
                    });
                })
                .catch(xhr => {
                    this.showError(xhr.getResponseHeader('X-Status-Reason'));

                    Espo.Ui.notify(false);
                });
        },

        textNotification: function (text) {
            this.$el.find('.notify-text').html(text);
        },

        run: function (id, version) {
            let msg = this.translate('Upgrading...', 'labels', 'Admin');

            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            this.textNotification(msg);

            Espo.Ajax
                .postRequest('Admin/action/runUpgrade', {id: id}, {timeout: 0, bypassAppReload: true})
                .then(() => {
                    let cache = this.getCache();

                    if (cache) {
                        cache.clear();
                    }

                    this.createView('popup', 'views/admin/upgrade/done', {
                        version: version,
                    }, view => {
                        Espo.Ui.notify(false);

                        view.render();
                    });
                })
                .catch(xhr => {
                    this.$el.find('.panel.upload').removeClass('hidden');

                    let msg = xhr.getResponseHeader('X-Status-Reason');

                    this.textNotification(this.translate('Error') + ': ' + msg);
                });
        },
    });
});



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

define('views/admin/upgrade/done', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'done-modal',
        header: false,
        createButton: true,

        template: 'admin/upgrade/done',

        data: function () {
            return {
                version: this.options.version,
                text: this.translate('upgradeDone', 'messages', 'Admin').replace('{version}', this.options.version),
            };
        },

        setup: function () {
            this.on('remove', () => {
                window.location.reload();
            });

            this.buttonList = [
                {
                    name: 'close',
                    label: 'Close',
                    onClick: (dialog) => {
                        setTimeout(() => {
                            this.getRouter().navigate('#Admin', {trigger: true});
                        }, 500);

                        dialog.close();
                    },
                }
            ];

            this.header = this.getLanguage().translate('Upgraded successfully', 'labels', 'Admin');
        },
    });
});

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

define('views/admin/template-manager/index', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/template-manager/index',

        data: function () {
            return {
                templateDataList: this.templateDataList,
            };
        },

        events: {
            'click [data-action="selectTemplate"]': function (e) {
                var name = $(e.currentTarget).data('name');

                this.getRouter().checkConfirmLeaveOut(() => {
                    this.selectTemplate(name);
                });
            }
        },

        setup: function () {
            this.templateDataList = [];

            var templateList = Object.keys(this.getMetadata().get(['app', 'templates']) || {});

            templateList.sort((v1, v2) => {
                return this.translate(v1, 'templates', 'Admin')
                    .localeCompare(this.translate(v2, 'templates', 'Admin'));
            });

            templateList.forEach(template =>{
                var defs = this.getMetadata().get(['app', 'templates', template]);

                if (defs.scopeListConfigParam || defs.scopeList) {
                    var scopeList = Espo.Utils.clone(
                        defs.scopeList || this.getConfig().get(defs.scopeListConfigParam) || []);

                    scopeList.sort((v1, v2) => {
                        return this.translate(v1, 'scopeNames')
                            .localeCompare(this.translate(v2, 'scopeNames'));
                    });

                    scopeList.forEach(scope => {
                        let o = {
                            name: template + '_' + scope,
                            text: this.translate(template, 'templates', 'Admin') + ' :: ' +
                                this.translate(scope, 'scopeNames'),
                        };

                        this.templateDataList.push(o);
                    });

                    return;
                }

                var o = {
                    name: template,
                    text: this.translate(template, 'templates', 'Admin'),
                };

                this.templateDataList.push(o);
            });

            this.selectedTemplate = this.options.name;

            if (this.selectedTemplate) {
                this.once('after:render', () => {
                    this.selectTemplate(this.selectedTemplate, true);
                });
            }
        },

        selectTemplate: function (name) {
            this.selectedTemplate = name;

            this.getRouter().navigate('#Admin/templateManager/name=' + this.selectedTemplate, {trigger: false});

            this.createRecordView();

            this.$el.find('[data-action="selectTemplate"]')
                .removeClass('disabled')
                .removeAttr('disabled');

            this.$el.find('[data-name="'+name+'"][data-action="selectTemplate"]')
                .addClass('disabled')
                .attr('disabled', 'disabled');
        },

        createRecordView: function () {
            Espo.Ui.notify(' ... ');

            this.createView('record', 'views/admin/template-manager/edit', {
                selector: '.template-record',
                name: this.selectedTemplate,
            }, (view) => {
                view.render();

                Espo.Ui.notify(false);
                $(window).scrollTop(0);
            });
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Template Manager', 'labels', 'Admin'));
        },
    });
});

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

define('views/admin/template-manager/edit', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'admin/template-manager/edit',

        data: function () {
            return {
                title: this.title,
                hasSubject: this.hasSubject
            };
        },

        events: {
            'click [data-action="save"]': function () {
                this.actionSave();
            },
            'click [data-action="cancel"]': function () {
                this.actionCancel();
            },
            'click [data-action="resetToDefault"]': function () {
                this.actionResetToDefault();
            },
            'keydown.form': function (e) {
                let key = Espo.Utils.getKeyFromKeyEvent(e);

                if (key === 'Control+KeyS' || key === 'Control+Enter') {
                    this.actionSave();

                    e.preventDefault();
                    e.stopPropagation();
                }
            },
        },

        setup: function () {
            this.wait(true);

            this.fullName = this.options.name;

            this.name = this.fullName;
            this.scope = null;

            var arr = this.fullName.split('_');
            if (arr.length > 1) {
                this.scope = arr[1];
                this.name = arr[0];
            }

            this.hasSubject = !this.getMetadata().get(['app', 'templates', this.name, 'noSubject']);

            this.title = this.translate(this.name, 'templates', 'Admin');
            if (this.scope) {
                this.title += ' :: ' + this.translate(this.scope, 'scopeNames');
            }

            this.attributes = {};

            Espo.Ajax.getRequest('TemplateManager/action/getTemplate', {
                name: this.name,
                scope: this.scope
            }).then(function (data) {

                var model = this.model = new Model();
                model.name = 'TemplateManager';
                model.set('body', data.body);
                this.attributes.body = data.body;

                if (this.hasSubject) {
                    model.set('subject', data.subject);
                    this.attributes.subject = data.subject;
                 }

                this.listenTo(model, 'change', function () {
                    this.setConfirmLeaveOut(true);
                }, this);

                this.createView('bodyField', 'views/fields/wysiwyg', {
                    name: 'body',
                    model: model,
                    selector: '.body-field',
                    mode: 'edit'
                });

                if (this.hasSubject) {
                    this.createView('subjectField', 'views/fields/varchar', {
                        name: 'subject',
                        model: model,
                        selector: '.subject-field',
                        mode: 'edit'
                    });
                }

                this.wait(false);
            }.bind(this));
        },

        setConfirmLeaveOut: function (value) {
            this.getRouter().confirmLeaveOut = value;
        },

        afterRender: function () {
            this.$save = this.$el.find('button[data-action="save"]');
            this.$cancel = this.$el.find('button[data-action="cancel"]');
            this.$resetToDefault = this.$el.find('button[data-action="resetToDefault"]');
        },

        actionSave: function () {
            this.$save.addClass('disabled').attr('disabled');
            this.$cancel.addClass('disabled').attr('disabled');
            this.$resetToDefault.addClass('disabled').attr('disabled');

            this.getView('bodyField').fetchToModel();

            var data = {
                name: this.name,
                body: this.model.get('body')
            };
            if (this.scope) {
                data.scope = this.scope;
            }
            if (this.hasSubject) {
                this.getView('subjectField').fetchToModel();
                data.subject = this.model.get('subject');
            }

            Espo.Ui.notify(this.translate('saving', 'messages'));

            Espo.Ajax.postRequest('TemplateManager/action/saveTemplate', data)
            .then(() => {
                this.setConfirmLeaveOut(false);

                this.attributes.body = data.body;
                this.attributes.subject = data.subject;

                this.$save.removeClass('disabled').removeAttr('disabled');
                this.$cancel.removeClass('disabled').removeAttr('disabled');
                this.$resetToDefault.removeClass('disabled').removeAttr('disabled');

                Espo.Ui.success(this.translate('Saved'));
            })
            .catch(() => {
                this.$save.removeClass('disabled').removeAttr('disabled');
                this.$cancel.removeClass('disabled').removeAttr('disabled');
                this.$resetToDefault.removeClass('disabled').removeAttr('disabled');
            });
        },

        actionCancel: function () {
            this.model.set('subject', this.attributes.subject);
            this.model.set('body', this.attributes.body);

            this.setConfirmLeaveOut(false);
        },

        actionResetToDefault: function () {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                this.$save.addClass('disabled').attr('disabled');
                this.$cancel.addClass('disabled').attr('disabled');
                this.$resetToDefault.addClass('disabled').attr('disabled');

                var data = {
                    name: this.name,
                    body: this.model.get('body')
                };

                if (this.scope) {
                    data.scope = this.scope;
                }

                Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

                Espo.Ajax.postRequest('TemplateManager/action/resetTemplate', data)
                    .then(returnData => {
                        this.$save.removeClass('disabled').removeAttr('disabled');
                        this.$cancel.removeClass('disabled').removeAttr('disabled');
                        this.$resetToDefault.removeClass('disabled').removeAttr('disabled');

                        this.attributes.body = returnData.body;
                        this.attributes.subject = returnData.subject;

                        this.model.set('subject', returnData.subject);
                        this.model.set('body', returnData.body);
                        this.setConfirmLeaveOut(false);

                        Espo.Ui.notify(false);
                    })
                    .catch(() => {
                        this.$save.removeClass('disabled').removeAttr('disabled');
                        this.$cancel.removeClass('disabled').removeAttr('disabled');
                        this.$resetToDefault.removeClass('disabled').removeAttr('disabled');
                    });
            });
        },
    });
});

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

define('views/admin/system-requirements/index', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/system-requirements/index',

        data: function () {
            return {
                phpRequirementList: this.requirementList.php,
                databaseRequirementList: this.requirementList.database,
                permissionRequirementList: this.requirementList.permission,
            };
        },

        setup: function () {
            this.requirementList = [];

            Espo.Ajax.getRequest('Admin/action/systemRequirementList').then(requirementList => {
                this.requirementList = requirementList;

                if (this.isRendered() || this.isBeingRendered()) {
                    this.reRender();
                }
            });
        },
    });
});

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

define('views/admin/panels/notifications', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/panels/notifications',

        data: function () {
            return {
                notificationList: this.notificationList,
            };
        },

        setup: function () {
            this.notificationList = [];

            Espo.Ajax.getRequest('Admin/action/adminNotificationList').then(notificationList => {
                this.notificationList = notificationList;

                if (this.isRendered() || this.isBeingRendered()) {
                    this.reRender();
                }
            });
        },
    });
});

define("views/admin/link-manager/modals/edit", ["exports", "views/modal", "model", "views/admin/link-manager/index", "views/fields/enum"], function (_exports, _modal, _model, _index, _enum) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _modal = _interopRequireDefault(_modal);
  _model = _interopRequireDefault(_model);
  _index = _interopRequireDefault(_index);
  _enum = _interopRequireDefault(_enum);
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

  class LinkManagerEditModalView extends _modal.default {
    template = 'admin/link-manager/modals/edit';
    cssName = 'edit';
    className = 'dialog dialog-record';
    shortcutKeys = {
      /** @this LinkManagerEditModalView */
      'Control+KeyS': function (e) {
        this.save({
          noClose: true
        });
        e.preventDefault();
        e.stopPropagation();
      },
      /** @this LinkManagerEditModalView */
      'Control+Enter': function (e) {
        this.save();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    setup() {
      this.buttonList = [{
        name: 'save',
        label: 'Save',
        style: 'danger',
        onClick: () => {
          this.save();
        }
      }, {
        name: 'cancel',
        label: 'Cancel',
        onClick: () => {
          this.close();
        }
      }];
      const scope = this.scope = this.options.scope;
      const link = this.link = this.options.link || false;
      const entity = scope;
      const isNew = this.isNew = false === link;
      let header = 'Create Link';
      if (!isNew) {
        header = 'Edit Link';
      }
      this.headerText = this.translate(header, 'labels', 'Admin');
      const model = this.model = new _model.default();
      model.name = 'EntityManager';
      this.model.set('entity', scope);
      const allEntityList = this.getMetadata().getScopeEntityList().filter(item => {
        return this.getMetadata().get(['scopes', item, 'customizable']);
      }).sort((v1, v2) => {
        const t1 = this.translate(v1, 'scopeNames');
        const t2 = this.translate(v2, 'scopeNames');
        return t1.localeCompare(t2);
      });
      let isCustom = true;
      let linkType;
      if (!isNew) {
        const entityForeign = this.getMetadata().get('entityDefs.' + scope + '.links.' + link + '.entity');
        const linkForeign = this.getMetadata().get('entityDefs.' + scope + '.links.' + link + '.foreign');
        const label = this.getLanguage().translate(link, 'links', scope);
        let labelForeign = this.getLanguage().translate(linkForeign, 'links', entityForeign);
        const type = this.getMetadata().get('entityDefs.' + entity + '.links.' + link + '.type');
        const foreignType = this.getMetadata().get('entityDefs.' + entityForeign + '.links.' + linkForeign + '.type');
        if (type === 'belongsToParent') {
          linkType = 'childrenToParent';
          labelForeign = null;
          let entityTypeList = this.getMetadata().get(['entityDefs', entity, 'fields', link, 'entityList']) || [];
          if (this.getMetadata().get(['entityDefs', entity, 'fields', link, 'entityList']) === null) {
            entityTypeList = allEntityList;
            this.noParentEntityTypeList = true;
          }
          this.model.set('parentEntityTypeList', entityTypeList);
          const foreignLinkEntityTypeList = this.getForeignLinkEntityTypeList(entity, link, entityTypeList);
          this.model.set('foreignLinkEntityTypeList', foreignLinkEntityTypeList);
        } else {
          linkType = _index.default.prototype.computeRelationshipType.call(this, type, foreignType);
        }
        this.model.set('linkType', linkType);
        this.model.set('entityForeign', entityForeign);
        this.model.set('link', link);
        this.model.set('linkForeign', linkForeign);
        this.model.set('label', label);
        this.model.set('labelForeign', labelForeign);
        const linkMultipleField = this.getMetadata().get(['entityDefs', scope, 'fields', link, 'type']) === 'linkMultiple' && !this.getMetadata().get(['entityDefs', scope, 'fields', link, 'noLoad']);
        const linkMultipleFieldForeign = this.getMetadata().get(['entityDefs', entityForeign, 'fields', linkForeign, 'type']) === 'linkMultiple' && !this.getMetadata().get(['entityDefs', entityForeign, 'fields', linkForeign, 'noLoad']);
        this.model.set('linkMultipleField', linkMultipleField);
        this.model.set('linkMultipleFieldForeign', linkMultipleFieldForeign);
        if (linkType === 'manyToMany') {
          const relationName = this.getMetadata().get('entityDefs.' + entity + '.links.' + link + '.relationName');
          this.model.set('relationName', relationName);
        }
        const audited = this.getMetadata().get(['entityDefs', scope, 'links', link, 'audited']) || false;
        const auditedForeign = this.getMetadata().get(['entityDefs', entityForeign, 'links', linkForeign, 'audited']) || false;
        this.model.set('audited', audited);
        this.model.set('auditedForeign', auditedForeign);
        const layout = this.getMetadata().get(['clientDefs', scope, 'relationshipPanels', link, 'layout']);
        const layoutForeign = this.getMetadata().get(['clientDefs', entityForeign, 'relationshipPanels', linkForeign, 'layout']);
        this.model.set('layout', layout);
        this.model.set('layoutForeign', layoutForeign);
        isCustom = this.getMetadata().get('entityDefs.' + entity + '.links.' + link + '.isCustom');
      }
      const scopes = this.getMetadata().get('scopes') || null;
      const entityList = (Object.keys(scopes) || []).filter(item => {
        const d = scopes[item];
        return d.customizable && d.entity;
      }).sort((v1, v2) => {
        const t1 = this.translate(v1, 'scopeNames');
        const t2 = this.translate(v2, 'scopeNames');
        return t1.localeCompare(t2);
      });
      entityList.unshift('');
      this.createView('entity', 'views/fields/varchar', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="entity"]',
        defs: {
          name: 'entity'
        },
        readOnly: true
      });
      this.createView('entityForeign', 'views/fields/enum', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="entityForeign"]',
        defs: {
          name: 'entityForeign',
          params: {
            required: true,
            options: entityList,
            translation: 'Global.scopeNames'
          }
        },
        readOnly: !isNew
      });
      this.createView('linkType', 'views/fields/enum', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="linkType"]',
        defs: {
          name: 'linkType',
          params: {
            required: true,
            options: ['', 'oneToMany', 'manyToOne', 'manyToMany', 'oneToOneRight', 'oneToOneLeft', 'childrenToParent']
          }
        },
        readOnly: !isNew
      });
      this.createView('link', 'views/fields/varchar', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="link"]',
        defs: {
          name: 'link',
          params: {
            required: true,
            trim: true,
            maxLength: 61
          }
        },
        readOnly: !isNew
      });
      this.createView('linkForeign', 'views/fields/varchar', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="linkForeign"]',
        defs: {
          name: 'linkForeign',
          params: {
            required: true,
            trim: true,
            maxLength: 61
          }
        },
        readOnly: !isNew
      });
      this.createView('label', 'views/fields/varchar', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="label"]',
        defs: {
          name: 'label',
          params: {
            required: true,
            trim: true
          }
        }
      });
      this.createView('labelForeign', 'views/fields/varchar', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="labelForeign"]',
        defs: {
          name: 'labelForeign',
          params: {
            required: true,
            trim: true
          }
        }
      });
      if (isNew || this.model.get('relationName')) {
        this.createView('relationName', 'views/fields/varchar', {
          model: model,
          mode: 'edit',
          selector: '.field[data-name="relationName"]',
          defs: {
            name: 'relationName',
            params: {
              required: true,
              trim: true,
              maxLength: 61
            }
          },
          readOnly: !isNew
        });
      }
      this.createView('linkMultipleField', 'views/fields/bool', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="linkMultipleField"]',
        defs: {
          name: 'linkMultipleField'
        },
        readOnly: !isCustom,
        tooltip: true,
        tooltipText: this.translate('linkMultipleField', 'tooltips', 'EntityManager')
      });
      this.createView('linkMultipleFieldForeign', 'views/fields/bool', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="linkMultipleFieldForeign"]',
        defs: {
          name: 'linkMultipleFieldForeign'
        },
        readOnly: !isCustom,
        tooltip: true,
        tooltipText: this.translate('linkMultipleField', 'tooltips', 'EntityManager')
      });
      this.createView('audited', 'views/fields/bool', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="audited"]',
        defs: {
          name: 'audited'
        },
        tooltip: true,
        tooltipText: this.translate('linkAudited', 'tooltips', 'EntityManager')
      });
      this.createView('auditedForeign', 'views/fields/bool', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="auditedForeign"]',
        defs: {
          name: 'auditedForeign'
        },
        tooltip: true,
        tooltipText: this.translate('linkAudited', 'tooltips', 'EntityManager')
      });
      const layouts = ['', ...this.getEntityTypeLayouts(this.scope)];
      const layoutTranslatedOptions = this.getEntityTypeLayoutsTranslations(this.scope);
      this.layoutFieldView = new _enum.default({
        model: model,
        mode: 'edit',
        defs: {
          name: 'layout'
        },
        params: {
          options: ['']
        }
      });
      this.layoutForeignFieldView = new _enum.default({
        model: model,
        mode: 'edit',
        defs: {
          name: 'layoutForeign'
        },
        params: {
          options: layouts
        },
        translatedOptions: layoutTranslatedOptions
      });
      this.assignView('layout', this.layoutFieldView, '.field[data-name="layout"]');
      this.assignView('layoutForeign', this.layoutForeignFieldView, '.field[data-name="layoutForeign"]');
      this.createView('parentEntityTypeList', 'views/fields/entity-type-list', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="parentEntityTypeList"]',
        defs: {
          name: 'parentEntityTypeList'
        }
      });
      this.createView('foreignLinkEntityTypeList', 'views/admin/link-manager/fields/foreign-link-entity-type-list', {
        model: model,
        mode: 'edit',
        selector: '.field[data-name="foreignLinkEntityTypeList"]',
        defs: {
          name: 'foreignLinkEntityTypeList',
          params: {
            options: this.model.get('parentEntityTypeList') || []
          }
        }
      });
      this.model.fetchedAttributes = this.model.getClonedAttributes();
      this.listenTo(this.model, 'change', () => {
        if (!this.model.hasChanged('parentEntityTypeList') && !this.model.hasChanged('linkForeign') && !this.model.hasChanged('link')) {
          return;
        }
        const view = this.getView('foreignLinkEntityTypeList');
        if (view) {
          if (!this.noParentEntityTypeList) {
            view.setOptionList(this.model.get('parentEntityTypeList') || []);
          }
        }
        const checkedList = Espo.Utils.clone(this.model.get('foreignLinkEntityTypeList') || []);
        this.getForeignLinkEntityTypeList(this.model.get('entity'), this.model.get('link'), this.model.get('parentEntityTypeList') || [], true).forEach(item => {
          if (!~checkedList.indexOf(item)) {
            checkedList.push(item);
          }
        });
        this.model.set('foreignLinkEntityTypeList', checkedList);
      });
      this.controlLayoutField();
      this.listenTo(this.model, 'change:entityForeign', () => this.controlLayoutField());
    }
    getEntityTypeLayouts(entityType) {
      const defs = this.getMetadata().get(['clientDefs', entityType, 'additionalLayouts'], {});
      return Object.keys(defs).filter(item => ['list', 'listSmall'].includes(defs[item].type));
    }
    getEntityTypeLayoutsTranslations(entityType) {
      const map = {};
      this.getEntityTypeLayouts(entityType).forEach(item => {
        map[item] = this.getLanguage().has(item, 'layouts', entityType) ? this.getLanguage().translate(item, 'layouts', entityType) : this.getLanguage().translate(item, 'layouts', 'Admin');
      });
      map[''] = this.translate('Default');
      return map;
    }
    controlLayoutField() {
      const foreignEntityType = this.model.get('entityForeign');
      const layouts = foreignEntityType ? ['', ...this.getEntityTypeLayouts(foreignEntityType)] : [''];
      this.layoutFieldView.translatedOptions = foreignEntityType ? this.getEntityTypeLayoutsTranslations(foreignEntityType) : {};
      this.layoutFieldView.setOptionList(layouts);
    }
    toPlural(string) {
      if (string.slice(-1) === 'y') {
        return string.substr(0, string.length - 1) + 'ies';
      }
      if (string.slice(-1) === 's') {
        return string.substr(0, string.length) + 'es';
      }
      return string + 's';
    }
    populateFields() {
      const entityForeign = this.model.get('entityForeign');
      const linkType = this.model.get('linkType');
      let link;
      let linkForeign;
      if (linkType === 'childrenToParent') {
        this.model.set('link', 'parent');
        this.model.set('label', 'Parent');
        linkForeign = this.toPlural(Espo.Utils.lowerCaseFirst(this.scope));
        if (this.getMetadata().get(['entityDefs', this.scope, 'links', 'parent'])) {
          this.model.set('link', 'parentAnother');
          this.model.set('label', 'Parent Another');
          linkForeign += 'Another';
        }
        this.model.set('linkForeign', linkForeign);
        this.model.set('labelForeign', '');
        this.model.set('entityForeign', null);
        return;
      } else {
        if (!entityForeign || !linkType) {
          this.model.set('link', '');
          this.model.set('linkForeign', '');
          this.model.set('label', '');
          this.model.set('labelForeign', '');
          return;
        }
      }
      switch (linkType) {
        case 'oneToMany':
          linkForeign = Espo.Utils.lowerCaseFirst(this.scope);
          link = this.toPlural(Espo.Utils.lowerCaseFirst(entityForeign));
          if (entityForeign === this.scope) {
            if (linkForeign === Espo.Utils.lowerCaseFirst(this.scope)) {
              linkForeign = linkForeign + 'Parent';
            }
          }
          break;
        case 'manyToOne':
          linkForeign = this.toPlural(Espo.Utils.lowerCaseFirst(this.scope));
          link = Espo.Utils.lowerCaseFirst(entityForeign);
          if (entityForeign === this.scope) {
            if (link === Espo.Utils.lowerCaseFirst(this.scope)) {
              link = link + 'Parent';
            }
          }
          break;
        case 'manyToMany':
          linkForeign = this.toPlural(Espo.Utils.lowerCaseFirst(this.scope));
          link = this.toPlural(Espo.Utils.lowerCaseFirst(entityForeign));
          if (link === linkForeign) {
            link = link + 'Right';
            linkForeign = linkForeign + 'Left';
          }
          let relationName;
          if (this.scope.localeCompare(entityForeign)) {
            relationName = Espo.Utils.lowerCaseFirst(this.scope) + entityForeign;
          } else {
            relationName = Espo.Utils.lowerCaseFirst(entityForeign) + this.scope;
          }
          this.model.set('relationName', relationName);
          break;
        case 'oneToOneLeft':
          linkForeign = Espo.Utils.lowerCaseFirst(this.scope);
          link = Espo.Utils.lowerCaseFirst(entityForeign);
          if (entityForeign === this.scope) {
            if (linkForeign === Espo.Utils.lowerCaseFirst(this.scope)) {
              link = link + 'Parent';
            }
          }
          break;
        case 'oneToOneRight':
          linkForeign = Espo.Utils.lowerCaseFirst(this.scope);
          link = Espo.Utils.lowerCaseFirst(entityForeign);
          if (entityForeign === this.scope) {
            if (linkForeign === Espo.Utils.lowerCaseFirst(this.scope)) {
              linkForeign = linkForeign + 'Parent';
            }
          }
          break;
      }
      let number = 1;
      while (this.getMetadata().get(['entityDefs', this.scope, 'links', link])) {
        link += number.toString();
        number++;
      }
      number = 1;
      while (this.getMetadata().get(['entityDefs', entityForeign, 'links', linkForeign])) {
        linkForeign += number.toString();
        number++;
      }
      this.model.set('link', link);
      this.model.set('linkForeign', linkForeign);
      const label = Espo.Utils.upperCaseFirst(link.replace(/([a-z])([A-Z])/g, '$1 $2'));
      const labelForeign = Espo.Utils.upperCaseFirst(linkForeign.replace(/([a-z])([A-Z])/g, '$1 $2'));
      this.model.set('label', label);
      this.model.set('labelForeign', labelForeign);
    }
    handleLinkChange(field) {
      let value = this.model.get(field);
      if (value) {
        value = value.replace(/-/g, ' ').replace(/_/g, ' ').replace(/[^\w\s]/gi, '').replace(/ (.)/g, (match, g) => {
          return g.toUpperCase();
        }).replace(' ', '');
        if (value.length) {
          value = Espo.Utils.lowerCaseFirst(value);
        }
      }
      this.model.set(field, value);
    }
    hideField(name) {
      const view = this.getView(name);
      if (view) {
        view.disabled = true;
      }
      this.$el.find('.cell[data-name=' + name + ']').addClass('hidden-cell');
    }
    showField(name) {
      const view = this.getView(name);
      if (view) {
        view.disabled = false;
      }
      this.$el.find('.cell[data-name=' + name + ']').removeClass('hidden-cell');
    }
    handleLinkTypeChange() {
      const linkType = this.model.get('linkType');
      this.showField('entityForeign');
      this.showField('labelForeign');
      this.hideField('parentEntityTypeList');
      this.hideField('foreignLinkEntityTypeList');
      if (linkType === 'manyToMany') {
        this.showField('relationName');
        this.showField('linkMultipleField');
        this.showField('linkMultipleFieldForeign');
        this.showField('audited');
        this.showField('auditedForeign');
        this.showField('layout');
        this.showField('layoutForeign');
      } else {
        this.hideField('relationName');
        if (linkType === 'oneToMany') {
          this.showField('linkMultipleField');
          this.hideField('linkMultipleFieldForeign');
          this.showField('audited');
          this.hideField('auditedForeign');
          this.showField('layout');
          this.hideField('layoutForeign');
        } else if (linkType === 'manyToOne') {
          this.hideField('linkMultipleField');
          this.showField('linkMultipleFieldForeign');
          this.hideField('audited');
          this.showField('auditedForeign');
          this.hideField('layout');
          this.showField('layoutForeign');
        } else {
          this.hideField('linkMultipleField');
          this.hideField('linkMultipleFieldForeign');
          this.hideField('audited');
          this.hideField('auditedForeign');
          this.hideField('layout');
          this.hideField('layoutForeign');
          if (linkType === 'parentToChildren') {
            this.showField('audited');
            this.hideField('auditedForeign');
            this.showField('layout');
            this.hideField('layoutForeign');
          } else if (linkType === 'childrenToParent') {
            this.hideField('audited');
            this.showField('auditedForeign');
            this.hideField('layout');
            this.hideField('layoutForeign');
            this.hideField('entityForeign');
            this.hideField('labelForeign');
            if (!this.noParentEntityTypeList) {
              this.showField('parentEntityTypeList');
            }
            if (!this.model.get('linkForeign')) {
              this.hideField('foreignLinkEntityTypeList');
            } else {
              this.showField('foreignLinkEntityTypeList');
            }
          } else {
            this.hideField('audited');
            this.hideField('auditedForeign');
            this.hideField('layout');
            this.hideField('layoutForeign');
          }
        }
      }
      if (!this.getMetadata().get(['scopes', this.scope, 'stream'])) {
        this.hideField('audited');
      }
      if (!this.getMetadata().get(['scopes', this.model.get('entityForeign'), 'stream'])) {
        this.hideField('auditedForeign');
      }
    }
    afterRender() {
      this.handleLinkTypeChange();
      this.getView('linkType').on('change', () => {
        this.handleLinkTypeChange();
        this.populateFields();
      });
      this.getView('entityForeign').on('change', () => {
        this.populateFields();
      });
      this.getView('link').on('change', () => {
        this.handleLinkChange('link');
      });
      this.getView('linkForeign').on('change', () => {
        this.handleLinkChange('linkForeign');
      });
    }

    /**
     * @param {{noClose?: boolean}} [options]
     */
    save(options) {
      options = options || {};
      const arr = ['link', 'linkForeign', 'label', 'labelForeign', 'linkType', 'entityForeign', 'relationName', 'linkMultipleField', 'linkMultipleFieldForeign', 'audited', 'auditedForeign', 'layout', 'layoutForeign', 'parentEntityTypeList', 'foreignLinkEntityTypeList'];
      let notValid = false;
      arr.forEach(item => {
        if (!this.hasView(item)) {
          return;
        }
        if (this.getView(item).mode !== 'edit') {
          return;
        }
        this.getView(item).fetchToModel();
      });
      arr.forEach(item => {
        if (!this.hasView(item)) {
          return;
        }
        const view = this.getView(item);
        if (view.mode !== 'edit') {
          return;
        }
        if (!view.disabled) {
          notValid = view.validate() || notValid;
        }
      });
      if (notValid) {
        return;
      }
      this.$el.find('button[data-name="save"]').addClass('disabled').attr('disabled');
      let url = 'EntityManager/action/createLink';
      if (!this.isNew) {
        url = 'EntityManager/action/updateLink';
      }
      const entity = this.scope;
      const entityForeign = this.model.get('entityForeign');
      const link = this.model.get('link');
      const linkForeign = this.model.get('linkForeign');
      const label = this.model.get('label');
      const labelForeign = this.model.get('labelForeign');
      const relationName = this.model.get('relationName');
      const linkMultipleField = this.model.get('linkMultipleField');
      const linkMultipleFieldForeign = this.model.get('linkMultipleFieldForeign');
      const audited = this.model.get('audited');
      const auditedForeign = this.model.get('auditedForeign');
      const layout = this.model.get('layout');
      const layoutForeign = this.model.get('layoutForeign');
      const linkType = this.model.get('linkType');
      const attributes = {
        entity: entity,
        entityForeign: entityForeign,
        link: link,
        linkForeign: linkForeign,
        label: label,
        labelForeign: labelForeign,
        linkType: linkType,
        relationName: relationName,
        linkMultipleField: linkMultipleField,
        linkMultipleFieldForeign: linkMultipleFieldForeign,
        audited: audited,
        auditedForeign: auditedForeign,
        layout: layout,
        layoutForeign: layoutForeign
      };
      if (!this.isNew) {
        if (attributes.label === this.model.fetchedAttributes.label) {
          delete attributes.label;
        }
        if (attributes.labelForeign === this.model.fetchedAttributes.labelForeign) {
          delete attributes.labelForeign;
        }
      }
      if (linkType === 'childrenToParent') {
        delete attributes.entityForeign;
        delete attributes.labelForeign;
        attributes.parentEntityTypeList = this.model.get('parentEntityTypeList');
        attributes.foreignLinkEntityTypeList = this.model.get('foreignLinkEntityTypeList');
        if (this.noParentEntityTypeList) {
          attributes.parentEntityTypeList = null;
        }
      }
      Espo.Ajax.postRequest(url, attributes).then(() => {
        if (!this.isNew) {
          Espo.Ui.success(this.translate('Saved'));
        } else {
          Espo.Ui.success(this.translate('Created'));
        }
        this.model.fetchedAttributes = this.model.getClonedAttributes();
        Promise.all([this.getMetadata().loadSkipCache(), this.getLanguage().loadSkipCache()]).then(() => {
          this.broadcastUpdate();
          this.trigger('after:save');
          if (!options.noClose) {
            this.close();
          }
          if (options.noClose) {
            this.$el.find('button[data-name="save"]').removeClass('disabled').removeAttr('disabled');
          }
        });
      }).catch(xhr => {
        if (xhr.status === 409) {
          const msg = this.translate('linkConflict', 'messages', 'EntityManager');
          const statusReasonHeader = xhr.getResponseHeader('X-Status-Reason');
          if (statusReasonHeader) {
            console.error(statusReasonHeader);
          }
          Espo.Ui.error(msg);
          xhr.errorIsHandled = true;
        }
        this.$el.find('button[data-name="save"]').removeClass('disabled').removeAttr('disabled');
      });
    }
    getForeignLinkEntityTypeList(entityType, link, entityTypeList, onlyNotCustom) {
      const list = [];
      entityTypeList.forEach(item => {
        const linkDefs = this.getMetadata().get(['entityDefs', item, 'links']) || {};
        let isFound = false;
        for (const i in linkDefs) {
          if (linkDefs[i].foreign === link && linkDefs[i].entity === entityType && linkDefs[i].type === 'hasChildren') {
            if (onlyNotCustom) {
              if (linkDefs[i].isCustom) {
                continue;
              }
            }
            isFound = true;
            break;
          }
        }
        if (isFound) {
          list.push(item);
        }
      });
      return list;
    }
    broadcastUpdate() {
      this.getHelper().broadcastChannel.postMessage('update:metadata');
      this.getHelper().broadcastChannel.postMessage('update:language');
    }
  }
  var _default = LinkManagerEditModalView;
  _exports.default = _default;
});

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

define('views/admin/link-manager/fields/foreign-link-entity-type-list', ['views/fields/checklist'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.params.translation = 'Global.scopeNames';

            Dep.prototype.setup.call(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.controlOptionsAvailability();
        },

        controlOptionsAvailability: function () {
            this.params.options.forEach(item => {
                var link = this.model.get('link');
                var linkForeign = this.model.get('linkForeign');
                var entityType = this.model.get('entity');

                var linkDefs = this.getMetadata().get(['entityDefs', item, 'links']) || {};

                var isFound = false;

                for (let i in linkDefs) {
                    if (
                        linkDefs[i].foreign === link &&
                        !linkDefs[i].isCustom &&
                        linkDefs[i].entity === entityType
                    ) {
                        isFound = true;
                    } else if (i === linkForeign && linkDefs[i].type !== 'hasChildren') {
                        isFound = true;
                    }
                }

                if (isFound) {
                    this.$el
                        .find('input[data-name="checklistItem-foreignLinkEntityTypeList-'+item+'"]')
                        .attr('disabled', 'disabled');
                }
            });
        },
    });
});

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

define('views/admin/layouts/side-panels-edit', ['views/admin/layouts/side-panels-detail'], function (Dep) {

    return Dep.extend({

        viewType: 'edit',
    });
});

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

define('views/admin/layouts/side-panels-edit-small', ['views/admin/layouts/side-panels-detail'], function (Dep) {

    return Dep.extend({

        viewType: 'editSmall',
    });
});

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

define('views/admin/layouts/side-panels-detail-small', ['views/admin/layouts/side-panels-detail'], function (Dep) {

    return Dep.extend({

        viewType: 'detailSmall',
    });
});

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

/**
 * @deprecated
 */
define('views/admin/layouts/relationships', ['views/admin/layouts/rows'], function (Dep) {

    return Dep.extend({

        dataAttributeList: [
            'name',
            'dynamicLogicVisible',
            'style',
            'dynamicLogicStyled',
        ],

        editable: true,

        dataAttributesDefs: {
            style: {
                type: 'enum',
                options: [
                    'default',
                    'success',
                    'danger',
                    'warning',
                    'info',
                ],
                translation: 'LayoutManager.options.style',
            },
            dynamicLogicVisible: {
                type: 'base',
                view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                tooltip: 'dynamicLogicVisible',
            },
            dynamicLogicStyled: {
                type: 'base',
                view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                tooltip: 'dynamicLogicStyled',
            },
            name: {
                readOnly: true,
            },
        },

        languageCategory: 'links',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.dataAttributesDefs = Espo.Utils.cloneDeep(this.dataAttributesDefs);

            this.dataAttributesDefs.dynamicLogicVisible.scope = this.scope;
            this.dataAttributesDefs.dynamicLogicStyled.scope = this.scope;

            this.wait(true);

            this.loadLayout(() => {
                this.wait(false);
            });
        },

        loadLayout: function (callback) {
            this.getModelFactory().create(this.scope, (model) => {
                this.getHelper().layoutManager.getOriginal(this.scope, this.type, this.setId, (layout) => {

                    let allFields = [];

                    for (let field in model.defs.links) {
                        if (['hasMany', 'hasChildren'].indexOf(model.defs.links[field].type) !== -1) {
                            if (this.isLinkEnabled(model, field)) {
                                allFields.push(field);
                            }
                        }
                    }

                    allFields.sort((v1, v2) => {
                        return this.translate(v1, 'links', this.scope)
                            .localeCompare(this.translate(v2, 'links', this.scope));
                    });

                    allFields.push('_delimiter_');

                    this.enabledFieldsList = [];

                    this.enabledFields = [];
                    this.disabledFields = [];

                    for (let i in layout) {
                        let item = layout[i];
                        let o;

                        if (typeof item == 'string' || item instanceof String) {
                            o = {
                                name: item,

                                label: this.getLanguage().translate(item, 'links', this.scope)
                            };
                        }
                        else {
                            o = item;

                            o.label = this.getLanguage().translate(o.name, 'links', this.scope);
                        }

                        if (o.name[0] === '_') {
                            o.notEditable = true;

                            if (o.name === '_delimiter_') {
                                o.label = '. . .';
                            }
                        }

                        this.dataAttributeList.forEach(attribute => {
                            if (attribute === 'name') {
                                return;
                            }

                            if (attribute in o) {
                                return;
                            }

                            var value = this.getMetadata()
                                .get(['clientDefs', this.scope, 'relationshipPanels', o.name, attribute]);

                            if (value === null) {
                                return;
                            }

                            o[attribute] = value;
                        });

                        this.enabledFields.push(o);
                        this.enabledFieldsList.push(o.name);
                    }

                    for (let i in allFields) {
                        if (!_.contains(this.enabledFieldsList, allFields[i])) {
                            var name = allFields[i];

                            var label = this.getLanguage().translate(name, 'links', this.scope);

                            let o = {
                                name: name,
                                label: label,
                            };

                            if (o.name[0] === '_') {
                                o.notEditable = true;

                                if (o.name === '_delimiter_') {
                                    o.label = '. . .';
                                }
                            }

                            this.disabledFields.push(o);
                        }
                    }

                    this.rowLayout = this.enabledFields;

                    for (let i in this.rowLayout) {
                        let o = this.rowLayout[i];

                        o.label = this.getLanguage().translate(this.rowLayout[i].name, 'links', this.scope);

                        if (o.name === '_delimiter_') {
                            o.label = '. . .';
                        }

                        this.itemsData[this.rowLayout[i].name] = Espo.Utils.cloneDeep(this.rowLayout[i]);
                    }

                    callback();
                });
            });
        },

        validate: function () {
            return true;
        },

        isLinkEnabled: function (model, name) {
            return !model.getLinkParam(name, 'disabled') &&
                !model.getLinkParam(name, 'utility') &&
                !model.getLinkParam(name, 'layoutRelationshipsDisabled');
        },
    });
});

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

define('views/admin/layouts/mass-update', ['views/admin/layouts/rows'], function (Dep) {

    return Dep.extend({

        dataAttributeList: ['name'],

        editable: false,

        ignoreList: [],

        ignoreTypeList: ['duration'],

        dataAttributesDefs: {
            name: {
                readOnly: true
            }
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.wait(true);

            this.loadLayout(() => {
                this.wait(false);
            });
        },

        loadLayout: function (callback) {
            this.getModelFactory().create(this.scope, (model) => {
                this.getHelper().layoutManager.getOriginal(this.scope, this.type, this.setId, (layout) => {

                    var allFields = [];

                    for (let field in model.defs.fields) {
                        if (
                            !model.getFieldParam(field, 'readOnly') &&
                            this.isFieldEnabled(model, field)
                        ) {
                            allFields.push(field);
                        }
                    }

                    allFields.sort((v1, v2) => {
                        return this.translate(v1, 'fields', this.scope)
                            .localeCompare(this.translate(v2, 'fields', this.scope));
                    });

                    this.enabledFieldsList = [];

                    this.enabledFields = [];
                    this.disabledFields = [];

                    for (let i in layout) {
                        this.enabledFields.push({
                            name: layout[i],
                            label: this.getLanguage().translate(layout[i], 'fields', this.scope),
                        });

                        this.enabledFieldsList.push(layout[i]);
                    }

                    for (let i in allFields) {
                        if (!_.contains(this.enabledFieldsList, allFields[i])) {
                            this.disabledFields.push({
                                name: allFields[i],
                                label: this.getLanguage().translate(allFields[i], 'fields', this.scope),
                            });
                        }
                    }

                    this.rowLayout = this.enabledFields;

                    for (let i in this.rowLayout) {
                        this.rowLayout[i].label = this.getLanguage()
                            .translate(this.rowLayout[i].name, 'fields', this.scope);

                        this.itemsData[this.rowLayout[i].name] = Espo.Utils.cloneDeep(this.rowLayout[i]);
                    }

                    callback();
                });
            });
        },

        fetch: function () {
            var layout = [];

            $("#layout ul.enabled > li").each((i, el) => {
                layout.push($(el).data('name'));
            });

            return layout;
        },

        validate: function () {
            return true;
        },

        isFieldEnabled: function (model, name) {
            if (this.ignoreList.indexOf(name) !== -1) {
                return false;
            }

            if (this.ignoreTypeList.indexOf(model.getFieldParam(name, 'type')) !== -1) {
                return false;
            }

            var layoutList = model.getFieldParam(name, 'layoutAvailabilityList');

            if (layoutList && !~layoutList.indexOf(this.type)) {
                return;
            }

            return !model.getFieldParam(name, 'disabled') &&
                !model.getFieldParam(name, 'utility') &&
                !model.getFieldParam(name, 'layoutMassUpdateDisabled') &&
                !model.getFieldParam(name, 'readOnly');
        },
    });
});

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

define('views/admin/layouts/list-small', ['views/admin/layouts/list'], function (Dep) {

    return Dep.extend({});
});

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

define('views/admin/layouts/kanban', ['views/admin/layouts/list'], function (Dep) {

    return Dep.extend({

        dataAttributeList: ['name', 'link', 'align', 'view', 'isLarge'],

        dataAttributesDefs: {
            link: {type: 'bool'},
            isLarge: {type: 'bool'},
            width: {type: 'float'},
            align: {
                type: 'enum',
                options: ["left", "right"]
            },
            view: {
                type: 'varchar',
                readOnly: true
            },
            name: {
                type: 'varchar',
                readOnly: true
            }
        },

        editable: true,

        ignoreList: [],

        ignoreTypeList: [],
    });
});

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

define('views/admin/layouts/filters', ['views/admin/layouts/rows'], function (Dep) {

    return Dep.extend({

        dataAttributeList: ['name'],

        editable: false,

        ignoreList: [],

        setup: function () {
            Dep.prototype.setup.call(this);

            this.wait(true);

            this.loadLayout(() => {
                this.wait(false);
            });
        },

        loadLayout: function (callback) {
            this.getModelFactory().create(this.scope, (model) => {
                this.getHelper().layoutManager.getOriginal(this.scope, this.type, this.setId, (layout) => {

                    let allFields = [];

                    for (let field in model.defs.fields) {
                        if (
                            this.checkFieldType(model.getFieldParam(field, 'type')) &&
                            this.isFieldEnabled(model, field)
                        ) {
                            allFields.push(field);
                        }
                    }

                    allFields.sort((v1, v2) => {
                        return this.translate(v1, 'fields', this.scope)
                            .localeCompare(this.translate(v2, 'fields', this.scope));
                    });

                    this.enabledFieldsList = [];
                    this.enabledFields = [];
                    this.disabledFields = [];

                    for (let i in layout) {
                        this.enabledFields.push({
                            name: layout[i],
                            label: this.getLanguage().translate(layout[i], 'fields', this.scope)
                        });

                        this.enabledFieldsList.push(layout[i]);
                    }

                    for (let i in allFields) {
                        if (!_.contains(this.enabledFieldsList, allFields[i])) {
                            this.disabledFields.push({
                                name: allFields[i],
                                label: this.getLanguage().translate(allFields[i], 'fields', this.scope)
                            });
                        }
                    }

                    this.rowLayout = this.enabledFields;

                    for (let i in this.rowLayout) {
                        this.rowLayout[i].label = this.getLanguage().translate(this.rowLayout[i].name, 'fields', this.scope);
                    }

                    callback();
                });
            });
        },

        fetch: function () {
            var layout = [];

            $("#layout ul.enabled > li").each((i, el) => {
                layout.push($(el).data('name'));
            });

            return layout;
        },

        checkFieldType: function (type) {
            return this.getFieldManager().checkFilter(type);
        },

        validate: function () {
            return true;
        },

        isFieldEnabled: function (model, name) {
            if (this.ignoreList.indexOf(name) !== -1) {
                return false;
            }

            return !model.getFieldParam(name, 'disabled') &&
                !model.getFieldParam(name, 'utility') &&
                !model.getFieldParam(name, 'layoutFiltersDisabled');
        },
    });
});

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

define('views/admin/layouts/detail-small', ['views/admin/layouts/detail'], function (Dep) {

    return Dep.extend({

        columnCount: 2,
    });
});

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

define('views/admin/layouts/detail-convert',[ 'views/admin/layouts/detail'], function (Dep) {

    return Dep.extend({});
});

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

define('views/admin/layouts/default-side-panel', ['views/admin/layouts/rows'], function (Dep) {

    return Dep.extend({

        dataAttributeList: ['name', 'view', 'customLabel'],

        dataAttributesDefs: {
            view: {
                type: 'varchar',
                readOnly: true
            },
            customLabel: {
                type: 'varchar',
                readOnly: true
            },
            name: {
                type: 'varchar',
                readOnly: true
            },
        },

        editable: false,

        languageCategory: 'fields',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.wait(true);
            this.loadLayout(function () {
                this.wait(false);
            }.bind(this));
        },

        validate: function () {
            return true;
        },

        loadLayout: function (callback) {
            this.getModelFactory().create(Espo.Utils.hyphenToUpperCamelCase(this.scope), (model) => {
                this.getHelper().layoutManager.getOriginal(this.scope, this.type, this.setId, (layout) => {
                    this.readDataFromLayout(model, layout);

                    if (callback) {
                        callback();
                    }
                });
            });
        },

        readDataFromLayout: function (model, layout) {
            var allFields = [];

            for (let field in model.defs.fields) {
                if (
                    this.checkFieldType(model.getFieldParam(field, 'type')) &&
                    this.isFieldEnabled(model, field)
                ) {
                    allFields.push(field);
                }
            }

            allFields.sort((v1, v2) => {
                return this.translate(v1, 'fields', this.scope)
                    .localeCompare(this.translate(v2, 'fields', this.scope));
            });

            if (~allFields.indexOf('assignedUser')) {
                allFields.unshift(':assignedUser');
            }

            this.enabledFieldsList = [];

            this.enabledFields = [];
            this.disabledFields = [];

            var labelList = [];
            var duplicateLabelList = [];

            for (let i = 0; i < layout.length; i++) {
                let item = layout[i];

                if (typeof item !== 'object') {
                    item = {
                        name: item,
                    };
                }

                let realName = item.name;

                if (realName.indexOf(':') === 0)
                    realName = realName.substr(1);

                let label = this.getLanguage().translate(realName, 'fields', this.scope);

                if (realName !== item.name) {
                    label = label + ' *';
                }

                if (~labelList.indexOf(label)) {
                    duplicateLabelList.push(label);
                }

                labelList.push(label);

                this.enabledFields.push({
                    name: item.name,
                    label: label,
                });

                this.enabledFieldsList.push(item.name);
            }

            for (let i = 0; i < allFields.length; i++) {
                if (!_.contains(this.enabledFieldsList, allFields[i])) {
                    let label = this.getLanguage().translate(allFields[i], 'fields', this.scope);

                    if (~labelList.indexOf(label)) {
                        duplicateLabelList.push(label);
                    }

                    labelList.push(label);

                    let fieldName = allFields[i];
                    let realName = fieldName;

                    if (realName.indexOf(':') === 0)
                        realName = realName.substr(1);

                    label = this.getLanguage().translate(realName, 'fields', this.scope);

                    if (realName !== fieldName) {
                        label = label + ' *';
                    }

                    let o = {
                        name: fieldName,
                        label: label,
                    };

                    let fieldType = this.getMetadata().get(['entityDefs', this.scope, 'fields', fieldName, 'type']);

                    if (fieldType) {
                        if (this.getMetadata().get(['fields', fieldType, 'notSortable'])) {
                            o.notSortable = true;
                        }
                    }

                    this.disabledFields.push(o);
                }
            }

            this.enabledFields.forEach(item =>  {
                if (~duplicateLabelList.indexOf(item.label)) {
                    item.label += ' (' + item.name + ')';
                }
            });

            this.disabledFields.forEach(item => {
                if (~duplicateLabelList.indexOf(item.label)) {
                    item.label += ' (' + item.name + ')';
                }
            });

            this.rowLayout = layout;

            for (let i in this.rowLayout) {
                var label = this.getLanguage().translate(this.rowLayout[i].name, 'fields', this.scope);

                this.enabledFields.forEach(item => {
                    if (item.name === this.rowLayout[i].name) {
                        label = item.label;
                    }
                });

                this.rowLayout[i].label = label;

                this.itemsData[this.rowLayout[i].name] = Espo.Utils.cloneDeep(this.rowLayout[i]);
            }
        },

        checkFieldType: function (type) {
            return true;
        },

        isFieldEnabled: function (model, name) {
            if (~['modifiedAt', 'createdAt', 'modifiedBy', 'createdBy'].indexOf(name)) {
                return false;
            }

            let layoutList = model.getFieldParam(name, 'layoutAvailabilityList');

            if (layoutList && !~layoutList.indexOf(this.type)) {
                return false;
            }

            if (
                model.getFieldParam(name, 'disabled') ||
                model.getFieldParam(name, 'utility')
            ) {
                return false;
            }

            if (model.getFieldParam(name, 'layoutDefaultSidePanelDisabled')) {
                return false;
            }

            if (model.getFieldParam(name, 'layoutDetailDisabled')) {
                return false;
            }

            return true;
        },
    });
});

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

define('views/admin/layouts/bottom-panels-edit-small', ['views/admin/layouts/bottom-panels-edit'], function (Dep) {

    return Dep.extend({

        viewType: 'editSmall',
    });
});

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

define('views/admin/layouts/record/edit-attributes', ['views/record/base'], function (Dep) {

    return Dep.extend({

        template: 'admin/layouts/record/edit-attributes',

        /** @internal Important for dynamic logic working. */
        mode: 'edit',

        data: function () {
            return {
                attributeDataList: this.getAttributeDataList()
            };
        },

        getAttributeDataList: function () {
            const list = [];

            this.attributeList.forEach(attribute => {
                const defs = this.attributeDefs[attribute] || {};

                const type = defs.type;

                const isWide = !['enum', 'bool', 'int', 'float', 'varchar'].includes(type) &&
                    attribute !== 'widthComplex';

                list.push({
                    name: attribute,
                    viewKey: attribute + 'Field',
                    isWide: isWide,
                    label: this.translate(defs.label || attribute, 'fields', 'LayoutManager'),
                });
            });

            return list;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.attributeList = this.options.attributeList || [];
            this.attributeDefs = this.options.attributeDefs || {};

            this.attributeList.forEach(field => {
                const params = this.attributeDefs[field] || {};
                const type = params.type || 'base';

                const viewName = params.view || this.getFieldManager().getViewName(type);

                this.createField(field, viewName, params);
            });
        },
    });
});

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

define('views/admin/layouts/modals/panel-attributes', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: `
            <div class="panel panel-default no-side-margin">
                <div class="panel-body">
                    <div class="edit-container">{{{edit}}}</div>
                </div>
            </div>
        `,

        className: 'dialog dialog-record',

        shortcutKeys: {
            'Control+Enter': function (e) {
                this.actionSave();

                e.preventDefault();
                e.stopPropagation();
            },
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'save',
                    text: this.translate('Apply'),
                    style: 'primary',
                },
                {
                    name: 'cancel',
                    text: 'Cancel',
                },
            ];

            let model = new Model();

            model.name = 'LayoutManager';
            model.set(this.options.attributes || {});

            let attributeList = this.options.attributeList;
            let attributeDefs = this.options.attributeDefs;

            this.createView('edit', 'views/admin/layouts/record/edit-attributes', {
                selector: '.edit-container',
                attributeList: attributeList,
                attributeDefs: attributeDefs,
                model: model,
                dynamicLogicDefs: this.options.dynamicLogicDefs,
            });
        },

        actionSave: function () {
            let editView = this.getView('edit');
            let attrs = editView.fetch();

            editView.model.set(attrs, {silent: true});

            if (editView.validate()) {
                return;
            }

            let attributes = editView.model.attributes;

            this.trigger('after:save', attributes);

            return true;
        },
    });
});

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

define('views/admin/layouts/modals/edit-attributes', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: `
            <div class="panel panel-default no-side-margin">
                <div class="panel-body">
                    <div class="edit-container">{{{edit}}}</div>
                </div>
            </div>
        `,

        className: 'dialog dialog-record',

        shortcutKeys: {
            'Control+Enter': function (e) {
                this.actionSave();

                e.preventDefault();
                e.stopPropagation();
            },
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'save',
                    text: this.translate('Apply'),
                    style: 'primary',
                },
                {
                    name: 'cancel',
                    text: this.translate('Cancel'),
                },
            ];

            const model = new Model();

            model.name = 'LayoutManager';

            model.set(this.options.attributes || {});

            this.headerText = null;

            if (this.options.languageCategory) {
                this.headerText = this.translate(
                    this.options.name,
                    this.options.languageCategory,
                    this.options.scope
                );
            }

            let attributeList = Espo.Utils.clone(this.options.attributeList || []);

            const filteredAttributeList = [];

            attributeList.forEach(item => {
                const defs = this.options.attributeDefs[item] || {};

                if (defs.readOnly || defs.hidden) {
                    return;
                }

                filteredAttributeList.push(item);
            });

            attributeList = filteredAttributeList;

            this.createView('edit', 'views/admin/layouts/record/edit-attributes', {
                selector: '.edit-container',
                attributeList: attributeList,
                attributeDefs: this.options.attributeDefs,
                dynamicLogicDefs: this.options.dynamicLogicDefs,
                model: model,
            });
        },

        actionSave: function () {
            const editView = this.getView('edit');

            const attrs = editView.fetch();

            editView.model.set(attrs, {silent: true});

            if (editView.validate()) {
                return;
            }

            const attributes = editView.model.attributes;

            this.trigger('after:save', attributes);

            return true;
        },
    });
});

define("views/admin/layouts/fields/width-complex", ["exports", "views/fields/base", "views/fields/enum", "model", "views/fields/float"], function (_exports, _base, _enum, _model, _float) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  _enum = _interopRequireDefault(_enum);
  _model = _interopRequireDefault(_model);
  _float = _interopRequireDefault(_float);
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

  class LayoutWidthComplexFieldView extends _base.default {
    editTemplateContent = `
        <div class="row">
            <div data-name="value" class="col-sm-6">{{{value}}}</div>
            <div data-name="unit" class="col-sm-6">{{{unit}}}</div>
        </div>

    `;
    getAttributeList() {
      return ['width', 'widthPx'];
    }
    setup() {
      this.auxModel = new _model.default();
      this.syncAuxModel();
      this.listenTo(this.model, 'change', () => this.syncAuxModel());
      const unitView = new _enum.default({
        name: 'unit',
        mode: 'edit',
        model: this.auxModel,
        params: {
          options: ['%', 'px']
        }
      });
      const valueView = new _float.default({
        name: 'value',
        mode: 'edit',
        model: this.auxModel
      });
      this.assignView('unit', unitView, '[data-name="unit"]');
      this.assignView('value', valueView, '[data-name="value"]');
      this.listenTo(this.auxModel, 'change', (m, o) => {
        if (!o.ui) {
          return;
        }
        this.model.set(this.fetch(), {
          ui: true
        });
      });
    }
    fetch() {
      if (this.auxModel.get('unit') === 'px') {
        return {
          width: null,
          widthPx: this.auxModel.get('value')
        };
      }
      return {
        width: this.auxModel.get('value'),
        widthPx: null
      };
    }
    syncAuxModel() {
      const width = this.model.get('width');
      const widthPx = this.model.get('widthPx');
      const unit = width || !widthPx ? '%' : 'px';
      this.auxModel.set({
        unit: unit,
        value: unit === 'px' ? widthPx : width
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = LayoutWidthComplexFieldView;
  _exports.default = _default;
});

define("views/admin/label-manager/index", ["exports", "view", "ui/select"], function (_exports, _view, _select) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _select = _interopRequireDefault(_select);
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

  class LabelManagerView extends _view.default {
    template = 'admin/label-manager/index';
    scopeList = null;
    scope = null;
    language = null;
    languageList = null;
    events = {
      /** @this LabelManagerView */
      'click [data-action="selectScope"]': function (e) {
        let scope = $(e.currentTarget).data('name');
        this.getRouter().checkConfirmLeaveOut(() => {
          this.selectScope(scope);
        });
      },
      /** @this LabelManagerView */
      'change select[data-name="language"]': function (e) {
        let language = $(e.currentTarget).val();
        this.getRouter().checkConfirmLeaveOut(() => {
          this.selectLanguage(language);
        });
      }
    };
    data() {
      return {
        scopeList: this.scopeList,
        languageList: this.languageList,
        scope: this.scope,
        language: this.language
      };
    }
    setup() {
      this.languageList = this.getMetadata().get(['app', 'language', 'list']) || ['en_US'];
      this.languageList.sort((v1, v2) => {
        return this.getLanguage().translateOption(v1, 'language').localeCompare(this.getLanguage().translateOption(v2, 'language'));
      });
      this.wait(true);
      Espo.Ajax.postRequest('LabelManager/action/getScopeList').then(scopeList => {
        this.scopeList = scopeList;
        this.scopeList.sort((v1, v2) => {
          return this.translate(v1, 'scopeNamesPlural').localeCompare(this.translate(v2, 'scopeNamesPlural'));
        });
        this.scopeList = this.scopeList.filter(scope => {
          if (scope === 'Global') {
            return;
          }
          if (this.getMetadata().get(['scopes', scope])) {
            if (this.getMetadata().get(['scopes', scope, 'disabled'])) {
              return;
            }
          }
          return true;
        });
        this.scopeList.unshift('Global');
        this.wait(false);
      });
      this.scope = this.options.scope || 'Global';
      this.language = this.options.language || this.getConfig().get('language');
      this.once('after:render', () => {
        this.selectScope(this.scope, true);
      });
    }
    afterRender() {
      _select.default.init(this.element.querySelector(`select[data-name="language"]`));
    }
    selectLanguage(language) {
      this.language = language;
      if (this.scope) {
        this.getRouter().navigate('#Admin/labelManager/scope=' + this.scope + '&language=' + this.language, {
          trigger: false
        });
      } else {
        this.getRouter().navigate('#Admin/labelManager/language=' + this.language, {
          trigger: false
        });
      }
      this.createRecordView();
    }
    selectScope(scope, skipRouter) {
      this.scope = scope;
      if (!skipRouter) {
        this.getRouter().navigate('#Admin/labelManager/scope=' + scope + '&language=' + this.language, {
          trigger: false
        });
      }
      this.$el.find('[data-action="selectScope"]').removeClass('disabled').removeAttr('disabled');
      this.$el.find('[data-name="' + scope + '"][data-action="selectScope"]').addClass('disabled').attr('disabled', 'disabled');
      this.createRecordView();
    }
    createRecordView() {
      Espo.Ui.notify(' ... ');
      this.createView('record', 'views/admin/label-manager/edit', {
        selector: '.language-record',
        scope: this.scope,
        language: this.language
      }, view => {
        view.render();
        Espo.Ui.notify(false);
        $(window).scrollTop(0);
      });
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Label Manager', 'labels', 'Admin'));
    }
  }
  var _default = LabelManagerView;
  _exports.default = _default;
});

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

define('views/admin/label-manager/edit', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/label-manager/edit',

        data: function () {
            return {
                categoryList: this.getCategoryList(),
                scope: this.scope
            };
        },

        events: {
            'click [data-action="showCategory"]': function (e) {
                var name = $(e.currentTarget).data('name');
                this.showCategory(name);
            },
            'click [data-action="hideCategory"]': function (e) {
                var name = $(e.currentTarget).data('name');
                this.hideCategory(name);
            },
            'click [data-action="cancel"]': function (e) {
                this.actionCancel();
            },
            'click [data-action="save"]': function (e) {
                this.actionSave();
            },
            'change input.label-value': function (e) {
                var name = $(e.currentTarget).data('name');
                var value = $(e.currentTarget).val();
                this.setLabelValue(name, value);
            }
        },

        setup: function () {
            this.scope = this.options.scope;
            this.language = this.options.language;

            this.dirtyLabelList = [];

            this.wait(true);

            Espo.Ajax.postRequest('LabelManager/action/getScopeData', {
                scope: this.scope,
                language: this.language,
            }).then(data => {
                this.scopeData = data;

                this.scopeDataInitial = Espo.Utils.cloneDeep(this.scopeData);
                this.wait(false);
            });
        },

        getCategoryList: function () {
            var categoryList = Object.keys(this.scopeData).sort((v1, v2) => {

                return v1.localeCompare(v2);
            });

            return categoryList;
        },

        setLabelValue: function (name, value) {
            var category = name.split('[.]')[0];

            value = value.replace(/\\\\n/i, '\n');

            value = value.trim();

            this.scopeData[category][name] = value;

            this.dirtyLabelList.push(name);
            this.setConfirmLeaveOut(true);

            if (!this.hasView(category)) {
                return;
            }

            this.getView(category).categoryData[name] = value;
        },

        setConfirmLeaveOut: function (value) {
            this.getRouter().confirmLeaveOut = value;
        },

        afterRender: function () {
            this.$save = this.$el.find('button[data-action="save"]');
            this.$cancel = this.$el.find('button[data-action="cancel"]');
        },

        actionSave: function () {
            this.$save.addClass('disabled').attr('disabled');
            this.$cancel.addClass('disabled').attr('disabled');

            var data = {};

            this.dirtyLabelList.forEach(name => {
                var category = name.split('[.]')[0];
                var value = this.scopeData[category][name];
                data[name] = value;
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            Espo.Ajax.postRequest('LabelManager/action/saveLabels', {
                scope: this.scope,
                language: this.language,
                labels: data,
            })
            .then(returnData => {
                this.scopeDataInitial = Espo.Utils.cloneDeep(this.scopeData);
                this.dirtyLabelList = [];
                this.setConfirmLeaveOut(false);

                this.$save.removeClass('disabled').removeAttr('disabled');
                this.$cancel.removeClass('disabled').removeAttr('disabled');

                for (var key in returnData) {
                    var name = key.split('[.]').splice(1).join('[.]');
                    this.$el.find('input.label-value[data-name="'+name+'"]').val(returnData[key]);
                }

                Espo.Ui.success(this.translate('Saved'));

                this.getHelper().broadcastChannel.postMessage('update:language');

                this.getLanguage().loadSkipCache();
            })
            .catch(() => {
                this.$save.removeClass('disabled').removeAttr('disabled');
                this.$cancel.removeClass('disabled').removeAttr('disabled');
            });
        },

        actionCancel: function () {
            this.scopeData = Espo.Utils.cloneDeep(this.scopeDataInitial);
            this.dirtyLabelList = [];

            this.setConfirmLeaveOut(false);

            this.getCategoryList().forEach(category => {
                if (!this.hasView(category)) {
                    return;
                }

                this.getView(category).categoryData = this.scopeData[category];
                this.getView(category).reRender();
            });
        },

        showCategory: function (category) {
            this.$el.find('a[data-action="showCategory"][data-name="'+category+'"]').addClass('hidden');

            if (this.hasView(category)) {
                this.$el.find('a[data-action="hideCategory"][data-name="'+category+'"]').removeClass('hidden');
                this.$el.find('.panel-body[data-name="'+category+'"]').removeClass('hidden');

                return;
            }

            this.createView(category, 'views/admin/label-manager/category', {
                selector: '.panel-body[data-name="'+category+'"]',
                categoryData: this.getCategoryData(category),
                scope: this.scope,
                language: this.language,
            }, view => {
                this.$el.find('.panel-body[data-name="'+category+'"]').removeClass('hidden');
                this.$el.find('a[data-action="hideCategory"][data-name="'+category+'"]').removeClass('hidden');
                view.render();
            });
        },

        hideCategory: function (category) {
            this.clearView(category);

            this.$el.find('.panel-body[data-name="'+category+'"]').addClass('hidden');
            this.$el.find('a[data-action="showCategory"][data-name="'+category+'"]').removeClass('hidden');
            this.$el.find('a[data-action="hideCategory"][data-name="'+category+'"]').addClass('hidden');
        },

        getCategoryData: function (category) {
            return this.scopeData[category] || {};
        },
    });
});



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

define('views/admin/label-manager/category', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/label-manager/category',

        data: function () {
            return {
                categoryDataList: this.getCategoryDataList()
            };
        },

        events: {},

        setup: function () {
            this.scope = this.options.scope;
            this.language = this.options.language;
            this.categoryData = this.options.categoryData;
        },

        getCategoryDataList: function () {
            var labelList = Object.keys(this.categoryData);

            labelList.sort((v1, v2) => {
                return v1.localeCompare(v2);
            });

            var categoryDataList = [];

            labelList.forEach(name => {
                var value = this.categoryData[name];

                if (value === null) {
                    value = '';
                }

                if (value.replace) {
                    value = value.replace(/\n/i, '\\n');
                }

                var o = {
                    name: name,
                    value: value,
                };

                var arr = name.split('[.]');

                o.label = arr.slice(1).join(' . ');

                categoryDataList.push(o);
            });

            return categoryDataList;
        },
    });
});

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

define('views/admin/job/list', ['views/list'], function (Dep) {

    return Dep.extend({

        createButton: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            if (!this.getHelper().getAppParam('isRestrictedMode') || this.getUser().isSuperAdmin()) {
                this.addMenuItem('buttons', {
                    link: '#Admin/jobsSettings',
                    text: this.translate('Settings', 'labels', 'Admin'),
                });
            }
        },

        getHeader: function () {
            return this.buildHeaderHtml([
                $('<a>')
                    .attr('href', '#Admin')
                    .text(this.translate('Administration')),
                $('<span>')
                    .text(this.getLanguage().translate('Jobs', 'labels', 'Admin')),
            ]);
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Jobs', 'labels', 'Admin'));
        },
    });
});

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

define('views/admin/job/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/record/row-actions/view-and-remove',
        massActionList: ['remove'],
        rowActionsColumnWidth: '5%',
    });
});

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

define('views/admin/job/record/detail-small', ['views/record/detail-small'], function (Dep) {

    return Dep.extend({

        sideView: null,
        isWide: true,
    });
});

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

define('views/admin/job/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        editDisabled: true,
        fullFormDisabled: true,
    });
});

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

define('views/admin/job/fields/name', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        getValueForDisplay: function () {
            if (this.mode === 'list' || this.mode === 'detail' || this.mode === 'listLink') {
                if (!this.model.get('name')) {
                    return this.model.get('serviceName') + ': ' + this.model.get('methodName');
                } else {
                    return this.model.get('name');
                }
            }
        },
    });
});

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

define('views/admin/integrations/oauth2', ['views/admin/integrations/edit'], function (Dep) {

    return Dep.extend({

        template: 'admin/integrations/oauth2',

        data: function () {
            let redirectUri = this.redirectUri ||
                (this.getConfig().get('siteUrl') + '?entryPoint=oauthCallback');

            return _.extend({
                redirectUri: redirectUri,
            }, Dep.prototype.data.call(this));
        },
    });
});

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

define('views/admin/integrations/index', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/integrations/index',

        integrationList: null,
        integration: null,

        data: function () {
            return {
                integrationList: this.integrationList,
                integration: this.integration,
            };
        },

        events: {
            'click #integrations-menu a.integration-link': function (e) {
                let name = $(e.currentTarget).data('name');

                this.openIntegration(name);
            },
        },

        setup: function () {
            this.integrationList = Object
                .keys(this.getMetadata().get('integrations') || {})
                .sort((v1, v2) => this.translate(v1, 'titles', 'Integration')
                    .localeCompare(this.translate(v2, 'titles', 'Integration'))
                );

            this.integration = this.options.integration || null;

            this.on('after:render', () => {
                this.renderHeader();

                if (!this.integration) {
                    this.renderDefaultPage();
                } else {
                    this.openIntegration(this.integration);
                }
            });
        },

        openIntegration: function (integration) {
            this.integration = integration;

            this.getRouter().navigate('#Admin/integrations/name=' + integration, {trigger: false});

            var viewName = this.getMetadata().get('integrations.' + integration + '.view') ||
                'views/admin/integrations/' +
                Espo.Utils.camelCaseToHyphen(this.getMetadata().get('integrations.' + integration + '.authMethod'));

            Espo.Ui.notify(' ... ');

            this.createView('content', viewName, {
                fullSelector: '#integration-content',
                integration: integration,
            }, view => {
                this.renderHeader();

                view.render();

                Espo.Ui.notify(false);

                $(window).scrollTop(0);
            });
        },

        renderDefaultPage: function () {
            $('#integration-header').html('').hide();

            let msg;

            if (this.integrationList.length) {
                msg = this.translate('selectIntegration', 'messages', 'Integration');
            } else {
                msg = '<p class="lead">' + this.translate('noIntegrations', 'messages', 'Integration') + '</p>';
            }

            $('#integration-content').html(msg);
        },

        renderHeader: function () {
            if (!this.integration) {
                $('#integration-header').html('');

                return;
            }

            $('#integration-header').show().html(this.translate(this.integration, 'titles', 'Integration'));
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Integrations', 'labels', 'Admin'));
        },
    });
});

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

define('views/admin/integrations/google-maps', ['views/admin/integrations/edit'], function (Dep) {

    return Dep.extend({
    });
});

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

define('views/admin/formula-sandbox/index', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'admin/formula-sandbox/index',

        targetEntityType: null,

        storageKey: 'formulaSandbox',

        data: function () {
            return {};
        },

        setup: function () {
            let entityTypeList = [''].concat(
                this.getMetadata()
                    .getScopeEntityList()
                    .filter(item => {
                        return this.getMetadata().get(['scopes', item, 'object']);
                    })
            );

            let data = {
                script: null,
                targetId: null,
                targetType: null,
                output: null,
            };

            if (this.getSessionStorage().has(this.storageKey)) {
                let storedData = this.getSessionStorage().get(this.storageKey);

                data.script = storedData.script || null;
                data.targetId = storedData.targetId || null;
                data.targetName = storedData.targetName || null;
                data.targetType = storedData.targetType || null;
            }

            let model = this.model = new Model();

            model.name = 'Formula';

            model.setDefs({
                fields: {
                    targetType: {
                        type: 'enum',
                        options: entityTypeList,
                        translation: 'Global.scopeNames',
                        view: 'views/fields/entity-type',
                    },
                    target: {
                        type: 'link',
                        entity: data.targetType,
                    },
                    script: {
                        type: 'formula',
                        view: 'views/fields/formula',
                    },
                    output: {
                        type: 'text',
                        readOnly: true,
                        displayRawText: true,
                        tooltip: true,
                    },
                    errorMessage: {
                        type: 'text',
                        readOnly: true,
                        displayRawText: true,
                    },
                }
            });

            model.set(data);

            this.createRecordView();

            this.listenTo(this.model, 'change:targetType', (m, v, o) => {
                if (!o.ui) {
                    return;
                }

                setTimeout(() => {
                    this.targetEntityType = this.model.get('targetType');

                    this.model.set({
                        targetId: null,
                        targetName: null,
                    }, {silent: true});

                    let attributes = Espo.Utils.cloneDeep(this.model.attributes);

                    this.clearView('record');

                    this.model.set(attributes, {silent: true});

                    this.model.defs.fields.target.entity = this.targetEntityType;

                    this.createRecordView()
                        .then(view => view.render());
                }, 10);
            });

            this.listenTo(this.model, 'run', () => this.run());

            this.listenTo(this.model, 'change', (m, o) => {
                if (!o.ui) {
                    return;
                }

                let dataToStore = {
                    script: this.model.get('script'),
                    targetType: this.model.get('targetType'),
                    targetId: this.model.get('targetId'),
                    targetName: this.model.get('targetName'),
                };

                this.getSessionStorage().set(this.storageKey, dataToStore);
            });
        },

        createRecordView: function () {
            return this.createView('record', 'views/admin/formula-sandbox/record/edit', {
                selector: '.record',
                model: this.model,
                targetEntityType: this.targetEntityType,
                confirmLeaveDisabled: true,
                shortcutKeysEnabled: true,
            });
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Formula Sandbox', 'labels', 'Admin'));
        },

        run: function () {
            let script = this.model.get('script');

            this.model.set({
                output: null,
                errorMessage: null,
            });

            if (script === '' || script === null) {
                this.model.set('output', null);

                Espo.Ui.warning(
                    this.translate('emptyScript', 'messages', 'Formula')
                );

                return;
            }

            Espo.Ajax
                .postRequest('Formula/action/run', {
                    expression: script,
                    targetId: this.model.get('targetId'),
                    targetType: this.model.get('targetType'),
                })
                .then(response => {
                    this.model.set('output', response.output || null);

                    let errorMessage = null;

                    if (!response.isSuccess) {
                        errorMessage = response.message || null;
                    }

                    this.model.set('errorMessage', errorMessage);

                    if (response.isSuccess) {
                        Espo.Ui.success(
                            this.translate('runSuccess', 'messages', 'Formula')
                        );

                        return;
                    }

                    if (response.isSyntaxError) {
                        let msg = this.translate('checkSyntaxError', 'messages', 'Formula');

                        if (response.message) {
                            msg += ' ' + response.message;
                        }

                        Espo.Ui.error(msg);

                        return;
                    }

                    let msg = this.translate('runError', 'messages', 'Formula');

                    if (response.message) {
                        msg += ' ' + response.message;
                    }

                    Espo.Ui.error(msg);
                });
        },
    });
});

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

define('views/admin/formula-sandbox/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        scriptAreaHeight: 400,

        bottomView: null,

        sideView: null,

        buttonList: [
            {
                name: 'run',
                label: 'Run',
                style: 'danger',
                title: 'Ctrl+Enter',
            },
        ],

        dropdownItemList: [],

        isWide: true,

        accessControlDisabled: true,

        saveAndContinueEditingAction: false,

        saveAndNewAction: false,

        shortcutKeyCtrlEnterAction: 'run',

        setup: function () {
            this.scope = 'Formula';

            let additionalFunctionDataList = [
                {
                    "name": "output\\print",
                    "insertText": "output\\print(VALUE)"
                },
                {
                    "name": "output\\printLine",
                    "insertText": "output\\printLine(VALUE)"
                }
            ];

            this.detailLayout = [
                {
                    rows: [
                        [
                            false,
                            {
                                name: 'targetType',
                                labelText: this.translate('targetType', 'fields', 'Formula'),
                            },
                            {
                                name: 'target',
                                labelText: this.translate('target', 'fields', 'Formula'),
                            },
                        ]
                    ]
                },
                {
                    rows: [
                        [
                            {
                                name: 'script',
                                noLabel: true,
                                options: {
                                    targetEntityType: this.model.get('targetType'),
                                    height: this.scriptAreaHeight,
                                    additionalFunctionDataList: additionalFunctionDataList,
                                },
                            },
                        ]
                    ]
                },
                {
                    name: 'output',
                    rows: [
                        [
                            {
                                name: 'errorMessage',
                                labelText: this.translate('error', 'fields', 'Formula'),
                            },
                        ],
                        [
                            {
                                name: 'output',
                                labelText: this.translate('output', 'fields', 'Formula'),
                            },
                        ]
                    ]
                },
            ];

            Dep.prototype.setup.call(this);

            if (!this.model.get('targetType')) {
                this.hideField('target');
            }
            else {
                this.showField('target');
            }

            this.controlTargetTypeField();
            this.listenTo(this.model, 'change:targetId', () => this.controlTargetTypeField());

            this.controlOutputField();
            this.listenTo(this.model, 'change', () => this.controlOutputField());
        },

        controlTargetTypeField: function () {
            if (this.model.get('targetId')) {
                this.setFieldReadOnly('targetType');

                return;
            }

            this.setFieldNotReadOnly('targetType');
        },

        controlOutputField: function () {
            if (this.model.get('errorMessage')) {
                this.showField('errorMessage');
            }
            else {
                this.hideField('errorMessage');
            }
        },

        actionRun: function () {
            this.model.trigger('run');
        },
    });
});

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

define('views/admin/formula/modals/add-function', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'admin/formula/modals/add-function',

        fitHeight: true,

        backdrop: true,

        events: {
            'click [data-action="add"]': function (e) {
                this.trigger('add', $(e.currentTarget).data('value'));
            }
        },

        data: function () {
            var text = this.translate('formulaFunctions', 'messages', 'Admin')
                .replace('{documentationUrl}', this.documentationUrl);
            text = this.getHelper().transformMarkdownText(text, {linksInNewTab: true}).toString();

            return {
                functionDataList: this.functionDataList,
                text: text,
            };
        },

        setup: function () {
            this.header = this.translate('Function');

            this.documentationUrl = 'https://docs.espocrm.com/administration/formula/';

            this.functionDataList = this.options.functionDataList ||
                this.getMetadata().get('app.formula.functionList') || [];
        },

    });
});

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

define('views/admin/formula/modals/add-attribute', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: '<div class="attribute" data-name="attribute">{{{attribute}}}</div>',

        backdrop: true,

        setup: function () {
            this.header = this.translate('Attribute');
            this.scope = this.options.scope;

            var model = new Model();

            this.createView('attribute', 'views/admin/formula/fields/attribute', {
                selector: '[data-name="attribute"]',
                model: model,
                mode: 'edit',
                scope: this.scope,
                defs: {
                    name: 'attribute',
                    params: {}
                },
                attributeList: this.options.attributeList,
            }, view => {
                this.listenTo(view, 'change', () => {
                    var list = model.get('attribute') || [];

                    if (!list.length) {
                        return;
                    }

                    this.trigger('add', list[0]);
                });
            });
        },

    });
});

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

define('views/admin/formula/fields/attribute', ['views/fields/multi-enum', 'ui/multi-select'],
function (Dep, /** module:ui/multi-select */MultiSelect) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            if (this.options.attributeList) {
                this.params.options = this.options.attributeList;

                return;
            }

            const attributeList = this.getFieldManager()
                .getEntityTypeAttributeList(this.options.scope)
                .concat(['id'])
                .sort();

            const links = this.getMetadata().get(['entityDefs', this.options.scope, 'links']) || {};

            const linkList = [];

            Object.keys(links).forEach(link => {
                const type = links[link].type;
                const scope = links[link].entity;

                if (!type) {
                    return;
                }

                if (!scope) {
                    return;
                }

                if (
                    links[link].disabled ||
                    links[link].utility
                ) {
                    return;
                }

                if (~['belongsToParent', 'hasOne', 'belongsTo'].indexOf(type)) {
                    linkList.push(link);
                }
            });

            linkList.sort();

            linkList.forEach(link => {
                const scope = links[link].entity;

                let linkAttributeList = this.getFieldManager()
                    .getEntityTypeAttributeList(scope)
                    .sort();

                linkAttributeList.forEach(item => {
                    attributeList.push(link + '.' + item);
                });
            });

            this.params.options = attributeList;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.$element) {
                MultiSelect.focus(this.$element);
            }
        },
    });
});

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

define('views/admin/field-manager/list', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/field-manager/list',

        data: function () {
            return {
                scope: this.scope,
                fieldDefsArray: this.fieldDefsArray,
                typeList: this.typeList,
                hasAddField: this.hasAddField,
            };
        },

        events: {
            'click [data-action="removeField"]': function (e) {
                var field = $(e.currentTarget).data('name');

                this.removeField(field);
            },
            'keyup input[data-name="quick-search"]': function (e) {
                this.processQuickSearch(e.currentTarget.value);
            },
        },

        setup: function () {
            this.scope = this.options.scope;

            this.isCustomizable =
                !!this.getMetadata().get(`scopes.${this.scope}.customizable`) &&
                this.getMetadata().get(`scopes.${this.scope}.entityManager.fields`) !== false;

            this.hasAddField = true;

            let entityManagerData = this.getMetadata().get(['scopes', this.scope, 'entityManager']) || {};

            if ('addField' in entityManagerData) {
                this.hasAddField = entityManagerData.addField;
            }

            this.wait(
                this.buildFieldDefs()
            );
        },

        afterRender: function () {
            this.$noData = this.$el.find('.no-data');

            this.$el.find('input[data-name="quick-search"]').focus();
        },

        buildFieldDefs: function () {
            return this.getModelFactory().create(this.scope).then(model => {
                this.fields = model.defs.fields;

                this.fieldList = Object.keys(this.fields).sort();
                this.fieldDefsArray = [];

                this.fieldList.forEach(field => {
                    let defs = this.fields[field];

                    this.fieldDefsArray.push({
                        name: field,
                        isCustom: defs.isCustom || false,
                        type: defs.type,
                        label: this.translate(field, 'fields', this.scope),
                        isEditable: !defs.customizationDisabled && this.isCustomizable,
                    });
                });
            });
        },

        removeField: function (field) {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ui.notify(' ... ');

                Espo.Ajax.request('Admin/fieldManager/' + this.scope + '/' + field, 'delete').then(() => {
                    Espo.Ui.success(this.translate('Removed'));

                    this.$el.find('tr[data-name="'+field+'"]').remove();
                    var data = this.getMetadata().data;

                    delete data['entityDefs'][this.scope]['fields'][field];

                    this.getMetadata().loadSkipCache().then(() =>
                        this.buildFieldDefs()
                            .then(() => {
                                this.broadcastUpdate();

                                return this.reRender();
                            })
                            .then(() =>
                                Espo.Ui.success(this.translate('Removed'))
                            )
                    );
                });
            });
        },

        broadcastUpdate: function () {
            this.getHelper().broadcastChannel.postMessage('update:metadata');
            this.getHelper().broadcastChannel.postMessage('update:language');
        },

        processQuickSearch: function (text) {
            text = text.trim();

            let $noData = this.$noData;

            $noData.addClass('hidden');

            if (!text) {
                this.$el.find('table tr.field-row').removeClass('hidden');

                return;
            }

            let matchedList = [];

            let lowerCaseText = text.toLowerCase();

            this.fieldDefsArray.forEach(item => {
                let matched = false;

                if (
                    item.label.toLowerCase().indexOf(lowerCaseText) === 0 ||
                    item.name.toLowerCase().indexOf(lowerCaseText) === 0
                ) {
                    matched = true;
                }

                if (!matched) {
                    let wordList = item.label.split(' ')
                        .concat(
                            item.label.split(' ')
                        );

                    wordList.forEach((word) => {
                        if (word.toLowerCase().indexOf(lowerCaseText) === 0) {
                            matched = true;
                        }
                    });
                }

                if (matched) {
                    matchedList.push(item.name);
                }
            });

            if (matchedList.length === 0) {
                this.$el.find('table tr.field-row').addClass('hidden');

                $noData.removeClass('hidden');

                return;
            }

            this.fieldDefsArray
                .map(item => item.name)
                .forEach(field => {
                    let $row = this.$el.find(`table tr.field-row[data-name="${field}"]`);

                    if (!~matchedList.indexOf(field)) {
                        $row.addClass('hidden');

                        return;
                    }

                    $row.removeClass('hidden');
                });
        },
    });
});

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

define('views/admin/field-manager/index', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/field-manager/index',

        scopeList: null,

        scope: null,

        type: null,

        data: function () {
            return {
                scopeList: this.scopeList,
                scope: this.scope,
            };
        },

        events: {
            'click #scopes-menu a.scope-link': function (e) {
                var scope = $(e.currentTarget).data('scope');

                this.openScope(scope);
            },

            'click #fields-content a.field-link': function (e) {
                e.preventDefault();

                var scope = $(e.currentTarget).data('scope');
                var field = $(e.currentTarget).data('field');

                this.openField(scope, field);
            },

            'click [data-action="addField"]': function () {
                this.createView('dialog', 'views/admin/field-manager/modals/add-field', {}, (view) => {
                    view.render();

                    this.listenToOnce(view, 'add-field', (type) => {
                        this.createField(this.scope, type);
                    });
                });
            },
        },

        setup: function () {
            this.scopeList = [];

            var scopesAll = Object.keys(this.getMetadata().get('scopes')).sort((v1, v2) => {
                return this.translate(v1, 'scopeNamesPlural').localeCompare(this.translate(v2, 'scopeNamesPlural'));
            });

            scopesAll.forEach((scope) => {
                if (this.getMetadata().get('scopes.' + scope + '.entity')) {
                    if (this.getMetadata().get('scopes.' + scope + '.customizable')) {
                        this.scopeList.push(scope);
                    }
                }
            });

            this.scope = this.options.scope || null;
            this.field = this.options.field || null;

            this.on('after:render', () => {
                if (!this.scope) {
                    this.renderDefaultPage();

                    return;
                }

                if (!this.field) {
                    this.openScope(this.scope);
                }
                else {
                    this.openField(this.scope, this.field);
                }
            });

            this.createView('header', 'views/admin/field-manager/header', {
                selector: '> .page-header',
                scope: this.scope,
                field: this.field,
            });
        },

        openScope: function (scope) {
            this.scope = scope;
            this.field = null;

            this.getView('header').setField(null);

            this.getRouter().navigate('#Admin/fieldManager/scope=' + scope, {trigger: false});

            Espo.Ui.notify(' ... ');

            this.createView('content', 'views/admin/field-manager/list', {
                fullSelector: '#fields-content',
                scope: scope,
            }, (view) => {
                view.render();

                Espo.Ui.notify(false);

                $(window).scrollTop(0);
            });
        },

        openField: function (scope, field) {
            this.scope = scope;
            this.field = field;

            this.getView('header').setField(field);

            this.getRouter()
                .navigate('#Admin/fieldManager/scope=' + scope + '&field=' + field, {trigger: false});

            Espo.Ui.notify(' ... ');

            this.createView('content', 'views/admin/field-manager/edit', {
                fullSelector: '#fields-content',
                scope: scope,
                field: field,
            }, (view) => {
                view.render();

                Espo.Ui.notify(false);

                $(window).scrollTop(0);

                this.listenTo(view, 'after:save', () => {
                    this.notify('Saved', 'success');
                });
            });
        },

        createField: function (scope, type) {
            this.scope = scope;
            this.type = type;

            this.getRouter()
                .navigate('#Admin/fieldManager/scope=' + scope + '&type=' + type + '&create=true', {trigger: false});

            Espo.Ui.notify(' ... ');

            this.createView('content', 'Admin.FieldManager.Edit', {
                fullSelector: '#fields-content',
                scope: scope,
                type: type,
            }, (view) => {
                view.render();

                Espo.Ui.notify(false);

                $(window).scrollTop(0);

                view.once('after:save', () => {
                    this.openScope(this.scope);

                    this.notify('Created', 'success');
                });
            });
        },

        renderDefaultPage: function () {
            $('#fields-content').html(this.translate('selectEntityType', 'messages', 'Admin'));
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Field Manager', 'labels', 'Admin'));
        },
    });
});

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

define('views/admin/field-manager/header', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/field-manager/header',

        data: function () {
            return {
                scope: this.scope,
                field: this.field,
            };
        },

        setup: function () {
            this.scope = this.options.scope;
            this.field = this.options.field;
        },

        setField: function (field) {
            this.field = field;

            if (this.isRendered()) {
                this.reRender();
            }
        },
    });
});

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

define('views/admin/field-manager/edit', ['view', 'model'], function (Dep, Model) {

    /**
     * @class
     * @name Class
     * @extends module:view
     * @memberOf module:views/admin/field-manager/edit
     */
    return Dep.extend(/** @lends module:views/admin/field-manager/edit.Class# */{

        template: 'admin/field-manager/edit',

        entityTypeWithTranslatedOptionsList: ['enum', 'multiEnum', 'array', 'phone'],

        paramWithTooltipList: [
            'audited',
            'required',
            'default',
            'min',
            'max',
            'maxLength',
            'after',
            'before',
            'readOnly',
            'readOnlyAfterCreate',
        ],

        /**
         * @type {{
         *     forbidden?: boolean,
         *     internal?: boolean,
         *     onlyAdmin?: boolean,
         *     readOnly?: boolean,
         *     nonAdminReadOnly?: boolean,
         * }|{}}
         */
        globalRestriction: null,

        hasAnyGlobalRestriction: false,

        /**
         * @readonly
         */
        globalRestrictionTypeList: [
            'forbidden',
            'internal',
            'onlyAdmin',
            'readOnly',
            'nonAdminReadOnly',
        ],

        data: function () {
            return {
                scope: this.scope,
                field: this.field,
                defs: this.defs,
                paramList: this.paramList,
                type: this.type,
                fieldList: this.fieldList,
                isCustom: this.defs.isCustom,
                isNew: this.isNew,
                hasDynamicLogicPanel: this.hasDynamicLogicPanel,
                hasResetToDefault: !this.defs.isCustom && !this.entityTypeIsCustom && !this.isNew,
            };
        },

        events: {
            'click button[data-action="close"]': function () {
                this.actionClose();
            },
            'click button[data-action="save"]': function () {
                this.save();
            },
            'click button[data-action="resetToDefault"]': function () {
                this.resetToDefault();
            },
            'keydown.form': function (e) {
                const key = Espo.Utils.getKeyFromKeyEvent(e);

                if (key === 'Control+KeyS' || key === 'Control+Enter') {
                    this.save();

                    e.preventDefault();
                    e.stopPropagation();
                }
            },
        },

        setupFieldData: function (callback) {
            this.defs = {};
            this.fieldList = [];

            this.model = new Model();
            this.model.name = 'Admin';
            this.model.urlRoot = 'Admin/fieldManager/' + this.scope;

            this.model.defs = {
                fields: {
                    name: {required: true, maxLength: 50},
                    label: {required: true},
                    tooltipText: {},
                }
            };

            this.entityTypeIsCustom = !!this.getMetadata().get(['scopes', this.scope, 'isCustom']);

            this.globalRestriction = {};

            if (!this.isNew) {
                this.model.id = this.field;
                this.model.scope = this.scope;

                this.model.set('name', this.field);
                this.model.set(
                    'label',
                    this.getLanguage().translate(this.field, 'fields', this.scope)
                );

                if (this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'tooltip'])) {
                    this.model.set(
                        'tooltipText',
                        this.getLanguage().translate(this.field, 'tooltips', this.scope)
                    );
                }

                this.globalRestriction = this.getMetadata().get(['entityAcl', this.scope, 'fields', this.field]) || {};

                const globalRestrictions = this.globalRestrictionTypeList.filter(item => this.globalRestriction[item]);

                if (globalRestrictions.length) {
                    this.model.set('globalRestrictions', globalRestrictions);
                    this.hasAnyGlobalRestriction = true;
                }
            }
            else {
                this.model.scope = this.scope;
                this.model.set('type', this.type);
            }

            this.listenTo(this.model, 'change:readOnly', () => {
                this.readOnlyControl();
            });

            let hasRequired = false;

            this.getModelFactory().create(this.scope, model => {
                if (!this.isNew) {
                    this.type = model.getFieldType(this.field);
                }

                if (
                    this.getMetadata().get(['scopes', this.scope, 'hasPersonalData']) &&
                    this.getMetadata().get(['fields', this.type, 'personalData'])
                ) {
                    this.hasPersonalData = true;
                }

                this.hasInlineEditDisabled = !['foreign', 'autoincrement'].includes(this.type) &&
                    !this.getMetadata()
                        .get(['entityDefs', this.scope, 'fields', this.field,
                            'customizationInlineEditDisabledDisabled']);

                this.hasTooltipText = !this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field,
                    'customizationTooltipTextDisabled']);

                new Promise(resolve => {
                    if (this.isNew) {
                        resolve();

                        return;
                    }

                    Espo.Ajax.getRequest('Admin/fieldManager/' + this.scope + '/' + this.field)
                        .then(data => {
                            this.defs = data;

                            resolve();
                        });
                })
                .then(() => {
                    const promiseList = [];
                    this.paramList = [];
                    const paramList = Espo.Utils.clone(this.getFieldManager().getParamList(this.type) || []);

                    if (!this.isNew) {
                        const fieldManagerAdditionalParamList =
                            this.getMetadata()
                                .get([
                                    'entityDefs', this.scope, 'fields',
                                    this.field, 'fieldManagerAdditionalParamList'
                                ]) || [];

                        fieldManagerAdditionalParamList.forEach((item) =>  {
                            paramList.push(item);
                        });
                    }

                    /** @var {string[]|null} */
                    const fieldManagerParamList = this.getMetadata()
                        .get(['entityDefs', this.scope, 'fields', this.field, 'fieldManagerParamList']);

                    paramList.forEach(o => {
                        const item = o.name;

                        if (fieldManagerParamList && fieldManagerParamList.indexOf(item) === -1) {
                            return;
                        }

                        if (
                            item === 'readOnly' &&
                            this.globalRestriction &&
                            this.globalRestriction.readOnly
                        ) {
                            return;
                        }

                        if (item === 'required') {
                            hasRequired = true;
                        }

                        if (
                            item === 'createButton' &&
                            ['assignedUser', 'assignedUsers', 'teams'].includes(this.field)
                        ) {
                            return;
                        }

                        if (
                            item === 'autocompleteOnEmpty' &&
                            ['assignedUser'].includes(this.field)
                        ) {
                            return;
                        }

                        const disableParamName = 'customization' + Espo.Utils.upperCaseFirst(item) + 'Disabled';

                        const isDisabled =
                            this.getMetadata()
                                .get(['entityDefs', this.scope, 'fields', this.field, disableParamName]);

                        if (isDisabled) {
                            return;
                        }

                        const viewParamName = 'customization' + Espo.Utils.upperCaseFirst(item) + 'View';

                        const view = this.getMetadata()
                            .get(['entityDefs', this.scope, 'fields', this.field, viewParamName]);

                        if (view) {
                            o.view = view;
                        }

                        this.paramList.push(o);
                    });

                    if (this.hasPersonalData) {
                        this.paramList.push({
                            name: 'isPersonalData',
                            type: 'bool',
                        });
                    }

                    if (
                        this.hasInlineEditDisabled &&
                        !this.globalRestriction.readOnly
                    ) {
                        this.paramList.push({
                            name: 'inlineEditDisabled',
                            type: 'bool',
                        });
                    }

                    if (this.hasTooltipText) {
                        this.paramList.push({
                            name: 'tooltipText',
                            type: 'text',
                            rowsMin: 1,
                            trim: true,
                        });
                    }

                    if (fieldManagerParamList) {
                        this.paramList = this.paramList
                            .filter(item => fieldManagerParamList.indexOf(item.name) !== -1);
                    }

                    this.paramList = this.paramList
                        .filter(item => {
                            return !(this.globalRestriction.readOnly && item.name === 'required');
                        });

                    const customizationDisabled = this.getMetadata()
                        .get(['entityDefs', this.scope, 'fields', this.field, 'customizationDisabled']);

                    if (
                        customizationDisabled ||
                        this.globalRestriction.forbidden
                    ) {
                        this.paramList = [];
                    }

                    if (this.hasAnyGlobalRestriction) {
                        this.paramList.push({
                            name: 'globalRestrictions',
                            type: 'array',
                            readOnly: true,
                            displayAsList: true,
                            translation: 'FieldManager.options.globalRestrictions',
                            options: this.globalRestrictionTypeList,
                        });
                    }

                    this.paramList.forEach(o => {
                        this.model.defs.fields[o.name] = o;
                    });

                    this.model.set(this.defs);

                    if (this.isNew) {
                        this.model.populateDefaults();
                    }

                    promiseList.push(
                        this.createFieldView('varchar', 'name', !this.isNew, {trim: true})
                    );

                    promiseList.push(
                        this.createFieldView('varchar', 'label', null, {trim: true})
                    );

                    this.hasDynamicLogicPanel = false;

                    promiseList.push(
                        this.setupDynamicLogicFields(hasRequired)
                    );

                    this.model.fetchedAttributes = this.model.getClonedAttributes();

                    this.paramList.forEach(o => {
                        if (o.hidden) {
                            return;
                        }

                        const options = {};

                        if (o.tooltip || ~this.paramWithTooltipList.indexOf(o.name)) {
                            options.tooltip = true;

                            let tooltip = o.name;

                            if (typeof o.tooltip === 'string') {
                                tooltip = o.tooltip;
                            }

                            options.tooltipText = this.translate(tooltip, 'tooltips', 'FieldManager');
                        }

                        if (o.readOnlyNotNew && !this.isNew) {
                            options.readOnly = true;
                        }

                        promiseList.push(
                            this.createFieldView(o.type, o.name, null, o, options)
                        );
                    });

                    Promise.all(promiseList).then(() => callback());
                });
            });

            this.listenTo(this.model, 'change', (m, o) => {
                if (!o.ui) {
                    return;
                }

                this.setIsChanged();
            });
        },

        setup: function () {
            this.scope = this.options.scope;
            this.field = this.options.field;
            this.type = this.options.type;

            this.isNew = !this.field;

            if (
                !this.getMetadata().get(['scopes', this.scope, 'customizable']) ||
                this.getMetadata().get(`scopes.${this.scope}.entityManager.fields`) === false ||
                (
                    this.field &&
                    this.getMetadata().get(`entityDefs.${this.scope}.fields.${this.field}.customizationDisabled`)
                )
            ) {
                Espo.Ui.notify(false);

                throw new Espo.Exceptions.NotFound("Entity type is not customizable.");
            }

            this.wait(true);

            this.setupFieldData(() => {
                this.wait(false);
            });
        },

        setupDynamicLogicFields: function (hasRequired) {
            const defs = this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field]) || {};

            if (
                defs.disabled ||
                defs.dynamicLogicDisabled ||
                defs.layoutDetailDisabled ||
                defs.utility
            ) {
                return Promise.resolve();
            }

            const promiseList = [];

            if (!defs.dynamicLogicVisibleDisabled) {
                const isVisible = this.getMetadata()
                    .get(['clientDefs', this.scope, 'dynamicLogic', 'fields', this.field, 'visible']);

                this.model.set(
                    'dynamicLogicVisible',
                    isVisible
                );

                promiseList.push(
                    this.createFieldView(null, 'dynamicLogicVisible', null, {
                        view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                        scope: this.scope
                    })
                );

                this.hasDynamicLogicPanel = true;
            }

            const readOnly = this.getMetadata().get(['fields', this.type, 'readOnly']);

            if (!defs.dynamicLogicRequiredDisabled && !readOnly && hasRequired) {
                const dynamicLogicRequired = this.getMetadata()
                    .get(['clientDefs', this.scope, 'dynamicLogic', 'fields', this.field, 'required']);

                this.model.set('dynamicLogicRequired', dynamicLogicRequired);

                promiseList.push(
                    this.createFieldView(null, 'dynamicLogicRequired', null, {
                        view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                        scope: this.scope,
                    })
                );

                this.hasDynamicLogicPanel = true;
            }

            if (!defs.dynamicLogicReadOnlyDisabled && !readOnly) {
                const dynamicLogicReadOnly = this.getMetadata()
                    .get(['clientDefs', this.scope, 'dynamicLogic', 'fields', this.field, 'readOnly']);

                this.model.set('dynamicLogicReadOnly', dynamicLogicReadOnly);

                promiseList.push(
                    this.createFieldView(null, 'dynamicLogicReadOnly', null, {
                        view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                        scope: this.scope,
                    })
                );

                this.hasDynamicLogicPanel = true;
            }

            const typeDynamicLogicOptions = this.getMetadata().get(['fields', this.type, 'dynamicLogicOptions']);

            if (typeDynamicLogicOptions && !defs.dynamicLogicOptionsDisabled) {
                const dynamicLogicOptions = this.getMetadata()
                    .get(['clientDefs', this.scope, 'dynamicLogic', 'options', this.field]);

                this.model.set('dynamicLogicOptions', dynamicLogicOptions);

                promiseList.push(
                    this.createFieldView(null, 'dynamicLogicOptions', null, {
                        view: 'views/admin/field-manager/fields/dynamic-logic-options',
                        scope: this.scope,
                    })
                );

                this.hasDynamicLogicPanel = true;
            }

            if (!defs.dynamicLogicInvalidDisabled && !readOnly) {
                const dynamicLogicInvalid = this.getMetadata()
                    .get(['clientDefs', this.scope, 'dynamicLogic', 'fields', this.field, 'invalid']);

                this.model.set('dynamicLogicInvalid', dynamicLogicInvalid);

                promiseList.push(
                    this.createFieldView(null, 'dynamicLogicInvalid', null, {
                        view: 'views/admin/field-manager/fields/dynamic-logic-conditions',
                        scope: this.scope,
                    })
                );

                this.hasDynamicLogicPanel = true;
            }

            return Promise.all(promiseList);
        },

        afterRender: function () {
            this.getView('name').on('change', () => {
                let name = this.model.get('name');

                let label = name;

                if (label.length) {
                     label = label.charAt(0).toUpperCase() + label.slice(1);
                }

                this.model.set('label', label);

                if (name) {
                    name = name
                        .replace(/-/g, '')
                        .replace(/_/g, '')
                        .replace(/[^\w\s]/gi, '')
                        .replace(/ (.)/g, (match, g) => {
                            return g.toUpperCase();
                        })
                        .replace(' ', '');

                    if (name.length) {
                         name = name.charAt(0).toLowerCase() + name.slice(1);
                    }
                }

                this.model.set('name', name);
            });
        },

        readOnlyControl: function () {
            if (this.model.get('readOnly')) {
                this.hideField('dynamicLogicReadOnly');
                this.hideField('dynamicLogicRequired');
                this.hideField('dynamicLogicOptions');
                this.hideField('dynamicLogicInvalid');
            }
            else {
                this.showField('dynamicLogicReadOnly');
                this.showField('dynamicLogicRequired');
                this.showField('dynamicLogicOptions');
                this.showField('dynamicLogicInvalid');
            }
        },

        hideField: function (name) {
            const f = () => {
                const view = this.getView(name);

                if (view) {
                    this.$el.find('.cell[data-name="' + name + '"]').addClass('hidden');

                    view.setDisabled();
                }
            };

            if (this.isRendered()) {
                f();
            }
            else {
                this.once('after:render', f);
            }
        },

        showField: function (name) {
            const f = () => {
                const view = this.getView(name);

                if (view) {
                    this.$el.find('.cell[data-name="' + name + '"]').removeClass('hidden');

                    view.setNotDisabled();
                }
            };

            if (this.isRendered()) {
                f();
            }
            else {
                this.once('after:render', f);
            }
        },

        createFieldView: function (type, name, readOnly, params, options, callback) {
            const viewName = (params || {}).view || this.getFieldManager().getViewName(type);

            const o = {
                model: this.model,
                selector: '.field[data-name="' + name + '"]',
                defs: {
                    name: name,
                    params: params
                },
                mode: readOnly ? 'detail' : 'edit',
                readOnly: readOnly,
                scope: this.scope,
                field: this.field,
            };

            _.extend(o, options || {});

            const promise = this.createView(name, viewName, o, callback);

            this.fieldList.push(name);

            return promise;
        },

        disableButtons: function () {
            this.$el.find('[data-action="save"]').attr('disabled', 'disabled').addClass('disabled');
            this.$el.find('[data-action="resetToDefault"]').attr('disabled', 'disabled').addClass('disabled');
        },

        enableButtons: function () {
            this.$el.find('[data-action="save"]').removeAttr('disabled').removeClass('disabled');
            this.$el.find('[data-action="resetToDefault"]').removeAttr('disabled').removeClass('disabled');
        },

        save: function () {
            this.disableButtons();

            this.fieldList.forEach(field => {
                const view = this.getView(field);

                if (!view.readOnly) {
                    view.fetchToModel();
                }
            });

            let notValid = false;

            this.fieldList.forEach((field) => {
                notValid = this.getView(field).validate() || notValid;
            });

            if (notValid) {
                this.notify('Not valid', 'error');
                this.enableButtons();

                return;
            }

            if (this.model.get('tooltipText') && this.model.get('tooltipText') !== '') {
                this.model.set('tooltip', true);
            }
            else {
                this.model.set('tooltip', false);
            }

            this.listenToOnce(this.model, 'sync', () => {
                Espo.Ui.notify(false);

                this.setIsNotChanged();
                this.enableButtons();
                this.updateLanguage();

                Promise.all([
                    this.getMetadata().loadSkipCache(),
                    this.getLanguage().loadSkipCache(),
                ])
                .then(() => this.trigger('after:save'));

                this.model.fetchedAttributes = this.model.getClonedAttributes();

                this.broadcastUpdate();
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            if (this.isNew) {
                this.model
                    .save()
                    .catch(() => this.enableButtons());

                return;
            }

            const attributes = this.model.getClonedAttributes();

            if (this.model.fetchedAttributes.label === attributes.label) {
                delete attributes.label;
            }

            if (
                this.model.fetchedAttributes.tooltipText === attributes.tooltipText ||
                !this.model.fetchedAttributes.tooltipText && !attributes.tooltipText
            ) {
                delete attributes.tooltipText;
            }

            if ('translatedOptions' in attributes) {
                if (_.isEqual(this.model.fetchedAttributes.translatedOptions, attributes.translatedOptions)) {
                    delete attributes.translatedOptions;
                }
            }

            this.model
                .save(attributes, {patch: true})
                .catch(() => this.enableButtons());
        },

        updateLanguage: function () {
            const langData = this.getLanguage().data;

            if (this.scope in langData) {
                if (!('fields' in langData[this.scope])) {
                    langData[this.scope]['fields'] = {};
                }

                langData[this.scope]['fields'][this.model.get('name')] = this.model.get('label');

                if (!('tooltips' in langData[this.scope])) {
                    langData[this.scope]['tooltips'] = {};
                }

                langData[this.scope]['tooltips'][this.model.get('name')] = this.model.get('tooltipText');

                if (
                    this.getMetadata().get(['fields', this.model.get('type'), 'translatedOptions']) &&
                    this.model.get('translatedOptions')
                ) {
                    langData[this.scope].options = langData[this.scope].options || {};

                    langData[this.scope]['options'][this.model.get('name')] =
                        this.model.get('translatedOptions') || {};
                }
            }
        },

        resetToDefault: function () {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

                Espo.Ajax.postRequest('FieldManager/action/resetToDefault', {
                    scope: this.scope,
                    name: this.field,
                }).then(() => {
                    Promise
                    .all([
                        this.getMetadata().loadSkipCache(),
                        this.getLanguage().loadSkipCache(),
                    ])
                    .then(() => {
                        this.setIsNotChanged();

                        this.setupFieldData(() => {
                            this.notify('Done', 'success');
                            this.reRender();
                            this.broadcastUpdate();
                        });
                    });
                });
            });
        },

        broadcastUpdate: function () {
            this.getHelper().broadcastChannel.postMessage('update:metadata');
            this.getHelper().broadcastChannel.postMessage('update:language');
            this.getHelper().broadcastChannel.postMessage('update:settings');
        },

        actionClose: function () {
            this.setIsNotChanged();

            this.getRouter().navigate('#Admin/fieldManager/scope=' + this.scope, {trigger: true});
        },

        setConfirmLeaveOut: function (value) {
            this.getRouter().confirmLeaveOut = value;
        },

        setIsChanged: function () {
            this.isChanged = true;
            this.setConfirmLeaveOut(true);
        },

        setIsNotChanged: function () {
            this.isChanged = false;
            this.setConfirmLeaveOut(false);
        },
    });
});

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

define('views/admin/field-manager/modals/add-field', ['views/modal'], function (Dep) {

    return Dep.extend({

        backdrop: true,

        template: 'admin/field-manager/modals/add-field',

        events: {
            'click a[data-action="addField"]': function (e) {
                let type = $(e.currentTarget).data('type');

                this.addField(type);
            },
            'keyup input[data-name="quick-search"]': function (e) {
                this.processQuickSearch(e.currentTarget.value);
            },
        },

        data: function () {
            return {
                typeList: this.typeList,
            };
        },

        setup: function () {
            this.headerText = this.translate('Add Field', 'labels', 'Admin');

            this.typeList = [];

            let fieldDefs = this.getMetadata().get('fields');

            Object.keys(this.getMetadata().get('fields')).forEach(type => {
                if (type in fieldDefs) {
                    if (!fieldDefs[type].notCreatable) {
                        this.typeList.push(type);
                    }
                }
            });

            this.typeDataList = this.typeList.map(type => {
                return {
                    type: type,
                    label: this.translate(type, 'fieldTypes', 'Admin'),
                };
            });

            this.typeList.sort((v1, v2) => {
                return this.translate(v1, 'fieldTypes', 'Admin')
                    .localeCompare(this.translate(v2, 'fieldTypes', 'Admin'));
            });
        },

        addField: function (type) {
            this.trigger('add-field', type);
            this.remove();
        },

        afterRender: function () {
            this.$noData = this.$el.find('.no-data');

            this.typeList.forEach(type => {
                let text = this.translate(type, 'fieldInfo', 'FieldManager');

                let $el = this.$el.find('a.info[data-name="'+type+'"]');

                if (text === type) {
                    $el.addClass('hidden');

                    return;
                }

                text = this.getHelper().transformMarkdownText(text, {linksInNewTab: true}).toString();

                Espo.Ui.popover($el, {
                    content: text,
                    placement: 'left',
                }, this);
            });

            setTimeout(() => this.$el.find('input[data-name="quick-search"]').focus(), 50);
        },

        processQuickSearch: function (text) {
            text = text.trim();

            let $noData = this.$noData;

            $noData.addClass('hidden');

            if (!text) {
                this.$el.find('ul .list-group-item').removeClass('hidden');

                return;
            }

            let matchedList = [];

            let lowerCaseText = text.toLowerCase();

            this.typeDataList.forEach(item => {
                let matched =
                    item.label.toLowerCase().indexOf(lowerCaseText) === 0 ||
                    item.type.toLowerCase().indexOf(lowerCaseText) === 0;

                if (matched) {
                    matchedList.push(item.type);
                }
            });

            if (matchedList.length === 0) {
                this.$el.find('ul .list-group-item').addClass('hidden');

                $noData.removeClass('hidden');

                return;
            }

            this.typeDataList.forEach(item => {
                let $row = this.$el.find(`ul .list-group-item[data-name="${item.type}"]`);

                if (!~matchedList.indexOf(item.type)) {
                    $row.addClass('hidden');

                    return;
                }

                $row.removeClass('hidden');
            });
        },
    });
});

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

define('views/admin/field-manager/fields/source-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getMetadata().get('entityDefs.Attachment.sourceList') || []);

            this.translatedOptions = {};

            this.params.options.forEach(item => {
                this.translatedOptions[item] = this.translate(item, 'scopeNamesPlural');
            });
        }
    });
});

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

define('views/admin/field-manager/fields/pattern', ['views/fields/varchar'], function (Dep) {

    /**
     * @class
     * @name Class
     * @memberOf module:views/admin/field-manager/fields/pattern
     * @extends module:views/fields/varchar
     */
    return Dep.extend(/** @lends module:views/admin/field-manager/fields/pattern.Class# */{

        noSpellCheck: true,

        setupOptions: function () {
            let patterns = this.getMetadata().get(['app', 'regExpPatterns']) || {};

            let patternList = Object.keys(patterns)
                .filter(item => !patterns[item].isSystem)
                .map(item => '$' + item);

            this.setOptionList(patternList);
        },
    })
});

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

define('views/admin/field-manager/fields/options-with-style', ['views/admin/field-manager/fields/options'],
function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.optionsStyleMap = this.model.get('style') || {};

            this.styleList = [
                'default',
                'success',
                'danger',
                'warning',
                'info',
                'primary',
            ];

            this.events['click [data-action="selectOptionItemStyle"]'] = (e) => {
                let $target = $(e.currentTarget);
                let style = $target.data('style');
                let value = $target.data('value').toString();

                this.changeStyle(value, style);
            };
        },

        changeStyle: function (value, style) {
            let valueInternal = value.replace(/"/g, '\\"');

            this.$el
                .find('[data-action="selectOptionItemStyle"][data-value="' + valueInternal + '"] .check-icon')
                .addClass('hidden');

            this.$el
                .find('[data-action="selectOptionItemStyle"][data-value="' + valueInternal + '"]' +
                    '[data-style="'+style+'"] .check-icon')
                .removeClass('hidden');

            let $item = this.$el.find('.list-group-item[data-value="' + valueInternal + '"]').find('.item-text');

            this.styleList.forEach(item => {
                $item.removeClass('text-' + item);
            });

            $item.addClass('text-' + style);

            if (style === 'default') {
                style = null;
            }

            this.optionsStyleMap[value] = style;
        },

        getItemHtml: function (value) {
            // Do not use the `html` method to avoid XSS.

            let html = Dep.prototype.getItemHtml.call(this, value);

            let styleList = this.styleList;
            let styleMap = this.optionsStyleMap;

            let style = 'default';
            let $liList = [];

            styleList.forEach(item => {
                let isHidden = true;

                if (styleMap[value] === item) {
                    style = item;
                    isHidden = false;
                }
                else {
                    if (item === 'default' && !styleMap[value]) {
                        isHidden = false;
                    }
                }

                let text = this.getLanguage().translateOption(item, 'style', 'LayoutManager');

                let $li = $('<li>')
                    .append(
                        $('<a>')
                            .attr('role', 'button')
                            .attr('tabindex', '0')
                            .attr('data-action', 'selectOptionItemStyle')
                            .attr('data-style', item)
                            .attr('data-value', value)
                            .append(
                                $('<span>')
                                    .addClass('check-icon fas fa-check pull-right')
                                    .addClass(isHidden ? 'hidden' : ''),
                                $('<div>')
                                    .addClass('text-' + item)
                                    .text(text)
                            )
                    );

                $liList.push($li);
            });

            let $dropdown = $('<div>')
                .addClass('btn-group pull-right')
                .append(
                    $('<button>')
                        .addClass('btn btn-link btn-sm dropdown-toggle')
                        .attr('type', 'button')
                        .attr('data-toggle', 'dropdown')
                        .append(
                            $('<span>').addClass('caret')
                        ),
                    $('<ul>')
                        .addClass('dropdown-menu pull-right')
                        .append($liList)
                );

            let $item = $(html);

            $item.find('.item-content > input').after($dropdown);
            $item.find('.item-text').addClass('text-' + style);
            $item.addClass('link-group-item-with-columns');

            return $item.get(0).outerHTML;
        },

        fetch: function () {
            let data = Dep.prototype.fetch.call(this);

            data.style = {};

            (data.options || []).forEach(item => {
                data.style[item] = this.optionsStyleMap[item] || null;
            });

            return data;
        },
    });
});

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

define('views/admin/field-manager/fields/options-reference', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        enumFieldTypeList: [
            'enum',
            'multiEnum',
            'array',
            'checklist',
            'varchar',
        ],

        setupOptions: function () {
            this.params.options = [''];

            let entityTypeList = Object.keys(this.getMetadata().get(['entityDefs']))
                .filter(item => this.getMetadata().get(['scopes', item, 'object']))
                .sort((s1, s2) => {
                    return this.getLanguage().translate(s1, 'scopesName')
                        .localeCompare(this.getLanguage().translate(s2, 'scopesName'));
                });

            this.translatedOptions = {};

            entityTypeList.forEach(entityType => {
                let fieldList =
                    Object.keys(this.getMetadata().get(['entityDefs', entityType, 'fields']) || [])
                        .filter(item => entityType !== this.model.scope || item !== this.model.get('name'))
                        .sort((s1, s2) => {
                            return this.getLanguage().translate(s1, 'fields', entityType)
                                .localeCompare(this.getLanguage().translate(s2, 'fields', entityType));
                        });

                fieldList.forEach(field => {
                    let {type, options, optionsPath, optionsReference} =
                        this.getMetadata().get(['entityDefs', entityType, 'fields', field]) || {};

                    if (!this.enumFieldTypeList.includes(type)) {
                        return;
                    }

                    if (optionsPath || optionsReference) {
                        return;
                    }

                    if (!options) {
                        return;
                    }

                    let value = entityType + '.' + field;

                    this.params.options.push(value);

                    this.translatedOptions[value] =
                        this.translate(entityType, 'scopeName') + ' · ' +
                        this.translate(field, 'fields', entityType);
                });
            });
        },
    });
});

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

define('views/admin/field-manager/fields/not-actual-options', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.params.options = Espo.Utils.clone(this.model.get('options')) || [];

            this.listenTo(this.model, 'change:options', (m, v, o) => {
                this.params.options = Espo.Utils.clone(m.get('options')) || [];

                this.reRender();
            });
        },
    });
});

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

define('views/admin/field-manager/fields/entity-list', ['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({
    });
});

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

define('views/admin/field-manager/fields/dynamic-logic-options', ['views/fields/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        editTemplate: 'admin/field-manager/fields/dynamic-logic-options/edit',

        events: {
            'click [data-action="editConditions"]': function (e) {
                var index = parseInt($(e.currentTarget).data('index'));

                this.edit(index);
            },
            'click [data-action="addOptionList"]': function (e) {
                this.addOptionList();
            },
            'click [data-action="removeOptionList"]': function (e) {
                var index = parseInt($(e.currentTarget).data('index'));
                this.removeItem(index);
            }
        },

        data: function () {
            return {
                itemDataList: this.itemDataList
            };
        },

        setup: function () {
            this.optionsDefsList = Espo.Utils.cloneDeep(this.model.get(this.name)) || []
            this.scope = this.options.scope;

            this.setupItems();
            this.setupItemViews();
        },

        setupItems: function () {
            this.itemDataList = [];

            this.optionsDefsList.forEach((item, i) => {
                this.itemDataList.push({
                    conditionGroupViewKey: 'conditionGroup' + i.toString(),
                    optionsViewKey: 'options' + i.toString(),
                    index: i,
                });
            });
        },

        setupItemViews: function () {
            this.optionsDefsList.forEach((item, i) => {
                this.createStringView(i);

                this.createOptionsView(i);
            });
        },

        createOptionsView: function (num) {
            var key = 'options' + num.toString();

            if (!this.optionsDefsList[num]) {
                return;
            }

            var model = new Model();

            model.set('options', this.optionsDefsList[num].optionList || []);

            this.createView(key, 'views/fields/multi-enum', {
                selector: '.options-container[data-key="'+key+'"]',
                model: model,
                name: 'options',
                mode: 'edit',
                params: {
                    options: this.model.get('options'),
                    translatedOptions: this.model.get('translatedOptions')
                }
            }, (view) => {
                if (this.isRendered()) {
                    view.render();
                }

                this.listenTo(this.model, 'change:options', () => {
                    view.setTranslatedOptions(this.getTranslatedOptions());

                    view.setOptionList(this.model.get('options'));
                });

                this.listenTo(model, 'change', () => {
                    this.optionsDefsList[num].optionList = model.get('options') || [];
                });
            });
        },

        getTranslatedOptions: function () {
            if (this.model.get('translatedOptions')) {
                return this.model.get('translatedOptions');
            }

            var translatedOptions = {};

            var list = this.model.get('options') || [];

            list.forEach((value) => {
                translatedOptions[value] = this.getLanguage()
                    .translateOption(value, this.options.field, this.options.scope);
            });

            return translatedOptions;
        },

        createStringView: function (num) {
            var key = 'conditionGroup' + num.toString();

            if (!this.optionsDefsList[num]) {
                return;
            }

            this.createView(key, 'views/admin/dynamic-logic/conditions-string/group-base', {
                selector: '.string-container[data-key="'+key+'"]',
                itemData: {
                    value: this.optionsDefsList[num].conditionGroup
                },
                operator: 'and',
                scope: this.scope,
            }, (view) => {
                if (this.isRendered()) {
                    view.render();
                }
            });
        },

        edit: function (num) {
            this.createView('modal', 'views/admin/dynamic-logic/modals/edit', {
                conditionGroup: this.optionsDefsList[num].conditionGroup,
                scope: this.options.scope,
            }, (view) => {
                view.render();

                this.listenTo(view, 'apply', (conditionGroup) => {
                    this.optionsDefsList[num].conditionGroup = conditionGroup;

                    this.trigger('change');

                    this.createStringView(num);
                });
            });
        },

        addOptionList: function () {
            var i = this.itemDataList.length;

            this.optionsDefsList.push({
                optionList: this.model.get('options') || [],
                conditionGroup: null,
            });

            this.setupItems();
            this.reRender();
            this.setupItemViews();

            this.trigger('change');
        },

        removeItem: function (num) {
            this.optionsDefsList.splice(num, 1);

            this.setupItems();
            this.reRender();
            this.setupItemViews();

            this.trigger('change');
        },

        fetch: function () {
            var data = {};

            data[this.name] = this.optionsDefsList;

            if (!this.optionsDefsList.length) {
                data[this.name] = null;
            }

            return data;
        },

    });
});

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

define('views/admin/field-manager/fields/dynamic-logic-conditions', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'admin/field-manager/fields/dynamic-logic-conditions/detail',
        editTemplate: 'admin/field-manager/fields/dynamic-logic-conditions/edit',

        events: {
            'click [data-action="editConditions"]': function () {
                this.edit();
            }
        },

        data: function () {
        },

        setup: function () {
            this.conditionGroup = Espo.Utils.cloneDeep((this.model.get(this.name) || {}).conditionGroup || []);

            this.scope = this.params.scope || this.options.scope;

            this.createStringView();
        },

        createStringView: function () {
            this.createView('conditionGroup', 'views/admin/dynamic-logic/conditions-string/group-base', {
                selector: '.top-group-string-container',
                itemData: {
                    value: this.conditionGroup
                },
                operator: 'and',
                scope: this.scope,
            }, (view) => {
                if (this.isRendered()) {
                    view.render();
                }
            });
        },

        edit: function () {
            this.createView('modal', 'views/admin/dynamic-logic/modals/edit', {
                conditionGroup: this.conditionGroup,
                scope: this.scope,
            }, (view) => {
                view.render();

                this.listenTo(view, 'apply', (conditionGroup) => {
                    this.conditionGroup = conditionGroup;

                    this.trigger('change');

                    this.createStringView();
                });
            });
        },

        fetch: function () {
            var data = {};

            data[this.name] = {
                conditionGroup: this.conditionGroup,
            };

            if (this.conditionGroup.length === 0) {
                data[this.name] = null;
            }

            return data;
        },
    });
});

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

define('views/admin/field-manager/fields/currency-default', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        fetchEmptyValueAsNull: true,

        setupOptions: function () {
            this.params.options = [''];

            (this.getConfig().get('currencyList') || []).forEach(item => {
                this.params.options.push(item);
            });
        },
    });
});

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

define('views/admin/field-manager/fields/phone/default', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setOptionList(this.model.get('typeList') || ['']);

            this.listenTo(this.model, 'change:typeList', () => {
                this.setOptionList(this.model.get('typeList') || ['']);
            });
        }
    });
});

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

define('views/admin/field-manager/fields/options/default', ['views/fields/enum'], function (Dep) {

    // noinspection JSUnusedGlobalSymbols
    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.validations.push('listed');

            this.updateAvailableOptions();

            this.listenTo(this.model, 'change', () => {
                if (
                    !this.model.hasChanged('options') &&
                    !this.model.hasChanged('optionsReference')
                ) {
                    return;
                }

                this.updateAvailableOptions();
            });
        },

        updateAvailableOptions: function () {
            this.setOptionList(this.getAvailableOptions());
        },

        getAvailableOptions: function () {
            const optionsReference = this.model.get('optionsReference');

            if (optionsReference) {
                const [entityType, field] = optionsReference.split('.');

                const options = this.getMetadata()
                    .get(`entityDefs.${entityType}.fields.${field}.options`) || [''];

                return Espo.Utils.clone(options);
            }

            return this.model.get('options') || [''];
        },

        validateListed: function () {
            const value = this.model.get(this.name) ?? '';

            if (!this.params.options) {
                return false;
            }

            const options = this.getAvailableOptions();

            if (options.indexOf(value) === -1) {
                const msg = this.translate('fieldInvalid', 'messages')
                    .replace('{field}', this.getLabelText());

                this.showValidationMessage(msg);

                return true;
            }

            return false;
        },
    });
});

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

define('views/admin/field-manager/fields/options/default-multi', ['views/fields/multi-enum'], function (Dep) {

    // noinspection JSUnusedGlobalSymbols
    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.validations.push('listed');

            this.updateAvailableOptions();

            this.listenTo(this.model, 'change', () => {
                if (
                    !this.model.hasChanged('options') &&
                    !this.model.hasChanged('optionsReference')
                ) {
                    return;
                }

                this.updateAvailableOptions();
            });
        },

        updateAvailableOptions: function () {
            this.setOptionList(this.getAvailableOptions());
        },

        getAvailableOptions: function () {
            const optionsReference = this.model.get('optionsReference');

            if (optionsReference) {
                const [entityType, field] = optionsReference.split('.');

                const options = this.getMetadata()
                    .get(`entityDefs.${entityType}.fields.${field}.options`) || [];

                return Espo.Utils.clone(options);
            }

            return this.model.get('options') || [];
        },

        validateListed: function () {
            /** @type string[] */
            const values = this.model.get(this.name) ?? [];

            if (!this.params.options) {
                return false;
            }

            const options = this.getAvailableOptions();

            for (const value of values) {
                if (options.indexOf(value) === -1) {
                    const msg = this.translate('fieldInvalid', 'messages')
                        .replace('{field}', this.getLabelText());

                    this.showValidationMessage(msg);

                    return true;
                }
            }

            return false;
        },
    });
});

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

define('views/admin/field-manager/fields/link-multiple/default', ['views/fields/link-multiple'], function (Dep) {

    return Dep.extend({

        data: function () {
            var defaultAttributes = this.model.get('defaultAttributes') || {};

            var nameHash = defaultAttributes[this.options.field + 'Names'] || {};
            var idValues = defaultAttributes[this.options.field + 'Ids'] || [];

            var data = Dep.prototype.data.call(this);

            data.nameHash = nameHash;
            data.idValues = idValues;

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.foreignScope = this.getMetadata()
                .get(['entityDefs', this.options.scope, 'links', this.options.field, 'entity']);
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            var defaultAttributes = {};

            defaultAttributes[this.options.field + 'Ids'] = data[this.idsName];
            defaultAttributes[this.options.field + 'Names'] = data[this.nameHashName];

            if (data[this.idsName] === null || data[this.idsName].length === 0) {
                defaultAttributes = null;
            }

            return {
                defaultAttributes: defaultAttributes
            };
        },

        copyValuesFromModel: function () {
            var defaultAttributes = this.model.get('defaultAttributes') || {};

            var idValues = defaultAttributes[this.options.field + 'Ids'] || [];
            var nameHash = defaultAttributes[this.options.field + 'Names'] || {};

            this.ids = idValues;
            this.nameHash = nameHash;
        },
    });
});

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

define('views/admin/field-manager/fields/link/default', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        data: function () {
            var defaultAttributes = this.model.get('defaultAttributes') || {};
            var nameValue = defaultAttributes[this.options.field + 'Name'] || null;
            var idValue = defaultAttributes[this.options.field + 'Id'] || null;

            var data = Dep.prototype.data.call(this);

            data.nameValue = nameValue;
            data.idValue = idValue;

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.foreignScope = this.getMetadata()
                .get(['entityDefs', this.options.scope, 'links', this.options.field, 'entity']);
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            var defaultAttributes = {};
            defaultAttributes[this.options.field + 'Id'] = data[this.idName];
            defaultAttributes[this.options.field + 'Name'] = data[this.nameName];

            if (data[this.idName] === null) {
                defaultAttributes = null;
            }

            return {
                defaultAttributes: defaultAttributes
            };
        },
    });
});

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

define('views/admin/field-manager/fields/foreign/link', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (!this.model.isNew()) {
                this.setReadOnly(true);
            }
        },

        setupOptions: function () {
            var links = this.getMetadata().get(['entityDefs', this.options.scope, 'links']) || {};

            this.params.options = Object.keys(Espo.Utils.clone(links)).filter((item) => {
                if (links[item].type !== 'belongsTo' && links[item].type !== 'hasOne') {
                    return;
                }

                if (links[item].noJoin) {
                    return;
                }

                if (links[item].disabled) {
                    return;
                }

                return true;
            });

            var scope = this.options.scope;

            this.translatedOptions = {};

            this.params.options.forEach((item) => {
                this.translatedOptions[item] = this.translate(item, 'links', scope);
            });

            this.params.options = this.params.options.sort((v1, v2) => {
                return this.translate(v1, 'links', scope).localeCompare(this.translate(v2, 'links', scope));
            });

            this.params.options.unshift('');
        },
    });
});

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

define('views/admin/field-manager/fields/foreign/field', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (!this.model.isNew()) {
                this.setReadOnly(true);
            }

            this.listenTo(this.model, 'change:field', () => {
                this.manageField();
            });

            this.viewValue = this.model.get('view');
        },

        setupOptions: function () {
            this.listenTo(this.model, 'change:link', () => {
                this.setupOptionsByLink();
                this.reRender();
            });

            this.setupOptionsByLink();
        },

        setupOptionsByLink: function () {
            this.typeList = this.getMetadata().get(['fields', 'foreign', 'fieldTypeList']);

            var link = this.model.get('link');

            if (!link) {
                this.params.options = [''];

                return;
            }

            var scope = this.getMetadata().get(['entityDefs', this.options.scope, 'links', link, 'entity']);

            if (!scope) {
                this.params.options = [''];

                return;
            }

            var fields = this.getMetadata().get(['entityDefs', scope, 'fields']) || {};

            this.params.options = Object.keys(Espo.Utils.clone(fields)).filter(item => {
                var type = fields[item].type;

                if (!~this.typeList.indexOf(type)) {
                    return;
                }

                if (
                    fields[item].disabled ||
                    fields[item].utility ||
                    fields[item].directAccessDisabled ||
                    fields[item].notStorable
                ) {
                    return;
                }

                return true;
            });

            this.translatedOptions = {};

            this.params.options.forEach(item => {
                this.translatedOptions[item] = this.translate(item, 'fields', scope);
            });

            this.params.options = this.params.options.sort((v1, v2) => {
                return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
            });

            this.params.options.unshift('');
        },

        manageField: function () {
            if (!this.model.isNew()) {
                return;
            }

            var link = this.model.get('link');
            var field = this.model.get('field');

            if (!link || !field) {
                return;
            }

            var scope = this.getMetadata().get(['entityDefs', this.options.scope, 'links', link, 'entity']);

            if (!scope) {
                return;
            }

            var type = this.getMetadata().get(['entityDefs', scope, 'fields', field, 'type']);

            this.viewValue = this.getMetadata().get(['fields', 'foreign', 'fieldTypeViewMap', type]);
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            if (this.model.isNew()) {
                if (this.viewValue) {
                    data['view'] = this.viewValue;
                }
            }

            return data;
        },
    });
});

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

define('views/admin/field-manager/fields/date/default', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            if (data[this.name] === '') {
                data[this.name] = null;
            }

            return data;
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            var value = this.model.get(this.name);

            if (this.params.options && value && !~(this.params.options).indexOf(value)) {
                this.params.options.push(value);
            }
        },
    });
});

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

define('views/admin/field-manager/fields/date/after-before', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            if (!this.model.scope) {
                return;
            }

            var list = this.getFieldManager().getEntityTypeFieldList(
                this.model.scope,
                {
                    typeList: ['date', 'datetime', 'datetimeOptional'],
                }
            );

            if (this.model.get('name')) {
                list = list.filter(function (item) {
                    return item !== this.model.get('name');
                }, this);
            }

            this.params.options = list;
        },

    });
});

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

define('views/admin/extensions/ready', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'ready-modal',

        header: false,

        template: 'admin/extensions/ready',

        createButton: true,

        data: function () {
            return {
                version: this.upgradeData.version,
                text: this.translate('installExtension', 'messages', 'Admin')
                    .replace('{version}', this.upgradeData.version)
                    .replace('{name}', this.upgradeData.name)
            };
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'run',
                    text: this.translate('Install', 'labels', 'Admin'),
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.upgradeData = this.options.upgradeData;

            this.header = this.getLanguage().translate('Ready for installation', 'labels', 'Admin');
        },

        actionRun: function () {
            this.trigger('run');
            this.remove();
        },
    });
});

define("views/admin/extensions/index", ["exports", "view", "helpers/list/select-provider"], function (_exports, _view, _selectProvider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _selectProvider = _interopRequireDefault(_selectProvider);
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
  var _default = _view.default.extend({
    template: 'admin/extensions/index',
    packageContents: null,
    events: {
      'change input[name="package"]': function (e) {
        this.$el.find('button[data-action="upload"]').addClass('disabled').attr('disabled', 'disabled');
        this.$el.find('.message-container').html('');
        const files = e.currentTarget.files;
        if (files.length) {
          this.selectFile(files[0]);
        }
      },
      'click button[data-action="upload"]': function () {
        this.upload();
      },
      'click [data-action="install"]': function (e) {
        const id = $(e.currentTarget).data('id');
        const name = this.collection.get(id).get('name');
        const version = this.collection.get(id).get('version');
        this.run(id, name, version);
      },
      'click [data-action="uninstall"]': function (e) {
        const id = $(e.currentTarget).data('id');
        this.confirm(this.translate('uninstallConfirmation', 'messages', 'Admin'), () => {
          Espo.Ui.notify(this.translate('Uninstalling...', 'labels', 'Admin'));
          Espo.Ajax.postRequest('Extension/action/uninstall', {
            id: id
          }, {
            timeout: 0,
            bypassAppReload: true
          }).then(() => {
            Espo.Ui.success(this.translate('Done'));
            setTimeout(() => window.location.reload(), 500);
          }).catch(xhr => {
            const msg = xhr.getResponseHeader('X-Status-Reason');
            this.showErrorNotification(this.translate('Error') + ': ' + msg);
          });
        });
      }
    },
    setup: function () {
      const selectProvider = new _selectProvider.default(this.getHelper().layoutManager, this.getHelper().metadata, this.getHelper().fieldManager);
      this.wait(this.getCollectionFactory().create('Extension').then(collection => {
        this.collection = collection;
        this.collection.maxSize = this.getConfig().get('recordsPerPage');
      }).then(() => selectProvider.get('Extension')).then(select => {
        this.collection.data.select = select.join(',');
      }).then(() => this.collection.fetch()).then(() => {
        this.createView('list', 'views/extension/record/list', {
          collection: this.collection,
          selector: '> .list-container'
        });
        if (this.collection.length === 0) {
          this.once('after:render', () => {
            this.$el.find('.list-container').addClass('hidden');
          });
        }
      }));
    },
    selectFile: function (file) {
      const fileReader = new FileReader();
      fileReader.onload = e => {
        this.packageContents = e.target.result;
        this.$el.find('button[data-action="upload"]').removeClass('disabled').removeAttr('disabled');
      };
      fileReader.readAsDataURL(file);
    },
    showError: function (msg) {
      msg = this.translate(msg, 'errors', 'Admin');
      this.$el.find('.message-container').html(msg);
    },
    showErrorNotification: function (msg) {
      if (!msg) {
        this.$el.find('.notify-text').addClass('hidden');
        return;
      }
      msg = this.translate(msg, 'errors', 'Admin');
      this.$el.find('.notify-text').html(msg);
      this.$el.find('.notify-text').removeClass('hidden');
    },
    upload: function () {
      this.$el.find('button[data-action="upload"]').addClass('disabled').attr('disabled', 'disabled');
      this.notify('Uploading...');
      Espo.Ajax.postRequest('Extension/action/upload', this.packageContents, {
        timeout: 0,
        contentType: 'application/zip'
      }).then(data => {
        if (!data.id) {
          this.showError(this.translate('Error occurred'));
          return;
        }
        Espo.Ui.notify(false);
        this.createView('popup', 'views/admin/extensions/ready', {
          upgradeData: data
        }, view => {
          view.render();
          this.$el.find('button[data-action="upload"]').removeClass('disabled').removeAttr('disabled');
          view.once('run', () => {
            view.close();
            this.$el.find('.panel.upload').addClass('hidden');
            this.run(data.id, data.version, data.name);
          });
        });
      }).catch(xhr => {
        this.showError(xhr.getResponseHeader('X-Status-Reason'));
        Espo.Ui.notify(false);
      });
    },
    run: function (id, version, name) {
      Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
      this.showError(false);
      this.showErrorNotification(false);
      Espo.Ajax.postRequest('Extension/action/install', {
        id: id
      }, {
        timeout: 0,
        bypassAppReload: true
      }).then(() => {
        const cache = this.getCache();
        if (cache) {
          cache.clear();
        }
        this.createView('popup', 'views/admin/extensions/done', {
          version: version,
          name: name
        }, view => {
          if (this.collection.length) {
            this.collection.fetch({
              bypassAppReload: true
            });
          }
          this.$el.find('.list-container').removeClass('hidden');
          this.$el.find('.panel.upload').removeClass('hidden');
          Espo.Ui.notify(false);
          view.render();
        });
      }).catch(xhr => {
        this.$el.find('.panel.upload').removeClass('hidden');
        const msg = xhr.getResponseHeader('X-Status-Reason');
        this.showErrorNotification(this.translate('Error') + ': ' + msg);
      });
    }
  });
  _exports.default = _default;
});

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

define('views/admin/extensions/done', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'done-modal',

        header: false,

        template: 'admin/extensions/done',

        createButton: true,

        data: function () {
            return {
                version: this.options.version,
                name: this.options.name,
                text: this.translate('extensionInstalled', 'messages', 'Admin')
                    .replace('{version}', this.options.version)
                    .replace('{name}', this.options.name)
            };
        },

        setup: function () {
            this.on('remove', () => {
                window.location.reload();
            });

            this.buttonList = [
                {
                    name: 'close',
                    label: 'Close',
                }
            ];

            this.header = this.getLanguage().translate('Installed successfully', 'labels', 'Admin');
        },
    });
});

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

define('views/admin/entity-manager/scope', ['view'], function (Dep) {

    return Dep.extend({

        template: 'admin/entity-manager/scope',

        scope: null,

        data: function () {
            return {
                scope: this.scope,
                isEditable: this.isEditable,
                isRemovable: this.isRemovable,
                isCustomizable: this.isCustomizable,
                type: this.type,
                hasLayouts: this.hasLayouts,
                label: this.label,
                hasFormula: this.hasFormula,
                hasFields: this.hasFields,
                hasRelationships: this.hasRelationships,
            };
        },

        events: {
            'click [data-action="editEntity"]': function () {
                this.getRouter().navigate('#Admin/entityManager/edit&scope=' + this.scope, {trigger: true});
            },
            'click [data-action="removeEntity"]': function () {
                this.removeEntity();
            },
            'click [data-action="editFormula"]': function () {
                this.editFormula();
            },
        },

        setup: function () {
            this.scope = this.options.scope;

            this.setupScopeData();
        },

        setupScopeData: function () {
            let scopeData = this.getMetadata().get(['scopes', this.scope]);
            let entityManagerData = this.getMetadata().get(['scopes', this.scope, 'entityManager']) || {};

            if (!scopeData) {
                throw new Espo.Exceptions.NotFound();
            }

            this.isRemovable = !!scopeData.isCustom;

            if (scopeData.isNotRemovable) {
                this.isRemovable = false;
            }

            this.isCustomizable = !!scopeData.customizable;
            this.type = scopeData.type;
            this.isEditable = true;
            this.hasLayouts = scopeData.layouts;
            this.hasFormula = this.isCustomizable;
            this.hasFields = this.isCustomizable;
            this.hasRelationships = this.isCustomizable;

            if (!scopeData.customizable) {
                this.isEditable = false;
            }

            if ('edit' in entityManagerData) {
                this.isEditable = entityManagerData.edit;
            }

            if ('layouts' in entityManagerData) {
                this.hasLayouts = entityManagerData.layouts;
            }

            if ('formula' in entityManagerData) {
                this.hasFormula = entityManagerData.formula;
            }

            if ('fields' in entityManagerData) {
                this.hasFields = entityManagerData.fields;
            }

            if ('relationships' in entityManagerData) {
                this.hasRelationships = entityManagerData.relationships;
            }

            this.label = this.getLanguage().translate(this.scope, 'scopeNames');
        },

        editFormula: function () {
            Espo.Ui.notify(' ... ');

            Espo.loader.requirePromise('views/admin/entity-manager/modals/select-formula')
                .then(View => {
                    /** @type {module:views/modal} */
                    let view = new View({
                        scope: this.scope,
                    });

                    this.assignView('dialog', view).then(() => {
                        Espo.Ui.notify(false);

                        view.render();
                    });
                });
        },

        removeEntity: function () {
            var scope = this.scope;

            this.confirm(this.translate('confirmRemove', 'messages', 'EntityManager'), () => {
                Espo.Ui.notify(
                    this.translate('pleaseWait', 'messages')
                );

                this.disableButtons();

                Espo.Ajax.postRequest('EntityManager/action/removeEntity', {
                    name: scope,
                })
                .then(() => {
                    this.getMetadata()
                        .loadSkipCache()
                        .then(() => {
                            this.getConfig().load().then(() => {
                                Espo.Ui.notify(false);

                                this.broadcastUpdate();

                                this.getRouter().navigate('#Admin/entityManager', {trigger: true});
                            });
                        });
                })
                .catch(() => this.enableButtons());
            });
        },

        updatePageTitle: function () {
            this.setPageTitle(
                this.getLanguage().translate('Entity Manager', 'labels', 'Admin')
            );
        },

        disableButtons: function () {
            this.$el.find('.btn.action').addClass('disabled').attr('disabled', 'disabled');
            this.$el.find('.item-dropdown-button').addClass('disabled').attr('disabled', 'disabled');
        },

        enableButtons: function () {
            this.$el.find('.btn.action').removeClass('disabled').removeAttr('disabled');
            this.$el.find('.item-dropdown-button"]').removeClass('disabled').removeAttr('disabled');
        },

        broadcastUpdate: function () {
            this.getHelper().broadcastChannel.postMessage('update:metadata');
            this.getHelper().broadcastChannel.postMessage('update:settings');
        },
    });
});

define("views/admin/entity-manager/index", ["exports", "view", "views/admin/entity-manager/modals/export"], function (_exports, _view, _export) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _export = _interopRequireDefault(_export);
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

  class EntityManagerIndexView extends _view.default {
    template = 'admin/entity-manager/index';
    scopeDataList = null;
    scope = null;
    data() {
      return {
        scopeDataList: this.scopeDataList
      };
    }
    events = {
      /** @this EntityManagerIndexView */
      'click button[data-action="createEntity"]': function () {
        this.getRouter().navigate('#Admin/entityManager/create&', {
          trigger: true
        });
      },
      /** @this EntityManagerIndexView */
      'keyup input[data-name="quick-search"]': function (e) {
        this.processQuickSearch(e.currentTarget.value);
      }
    };
    setupScopeData() {
      this.scopeDataList = [];
      let scopeList = Object.keys(this.getMetadata().get('scopes')).sort((v1, v2) => {
        return v1.localeCompare(v2);
      });
      let scopeListSorted = [];
      scopeList.forEach(scope => {
        var d = this.getMetadata().get('scopes.' + scope);
        if (d.entity && d.customizable) {
          scopeListSorted.push(scope);
        }
      });
      scopeList.forEach(scope => {
        var d = this.getMetadata().get('scopes.' + scope);
        if (d.entity && !d.customizable) {
          scopeListSorted.push(scope);
        }
      });
      scopeList = scopeListSorted;
      scopeList.forEach(scope => {
        let d = /** @type {Object.<string, *>} */this.getMetadata().get('scopes.' + scope);
        let isRemovable = !!d.isCustom;
        if (d.isNotRemovable) {
          isRemovable = false;
        }
        let hasView = d.customizable;
        this.scopeDataList.push({
          name: scope,
          isCustom: d.isCustom,
          isRemovable: isRemovable,
          hasView: hasView,
          type: d.type,
          label: this.getLanguage().translate(scope, 'scopeNames'),
          layouts: d.layouts
        });
      });
    }
    setup() {
      this.setupScopeData();
      this.addActionHandler('export', () => this.actionExport());
    }
    afterRender() {
      this.$noData = this.$el.find('.no-data');
      this.$el.find('input[data-name="quick-search"]').focus();
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Entity Manager', 'labels', 'Admin'));
    }
    processQuickSearch(text) {
      text = text.trim();
      let $noData = this.$noData;
      $noData.addClass('hidden');
      if (!text) {
        this.$el.find('table tr.scope-row').removeClass('hidden');
        return;
      }
      let matchedList = [];
      let lowerCaseText = text.toLowerCase();
      this.scopeDataList.forEach(item => {
        let matched = false;
        if (item.label.toLowerCase().indexOf(lowerCaseText) === 0 || item.name.toLowerCase().indexOf(lowerCaseText) === 0) {
          matched = true;
        }
        if (!matched) {
          let wordList = item.label.split(' ').concat(item.label.split(' '));
          wordList.forEach(word => {
            if (word.toLowerCase().indexOf(lowerCaseText) === 0) {
              matched = true;
            }
          });
        }
        if (matched) {
          matchedList.push(item.name);
        }
      });
      if (matchedList.length === 0) {
        this.$el.find('table tr.scope-row').addClass('hidden');
        $noData.removeClass('hidden');
        return;
      }
      this.scopeDataList.map(item => item.name).forEach(scope => {
        if (!~matchedList.indexOf(scope)) {
          this.$el.find('table tr.scope-row[data-scope="' + scope + '"]').addClass('hidden');
          return;
        }
        this.$el.find('table tr.scope-row[data-scope="' + scope + '"]').removeClass('hidden');
      });
    }
    actionExport() {
      const view = new _export.default();
      this.assignView('dialog', view).then(() => {
        view.render();
      });
    }
  }
  var _default = EntityManagerIndexView;
  _exports.default = _default;
});

define("views/admin/entity-manager/formula", ["exports", "view", "model", "views/admin/entity-manager/record/edit-formula", "underscore"], function (_exports, _view, _model, _editFormula, _underscore) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _model = _interopRequireDefault(_model);
  _editFormula = _interopRequireDefault(_editFormula);
  _underscore = _interopRequireDefault(_underscore);
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

  class EntityManagerFormulaView extends _view.default {
    template = 'admin/entity-manager/formula';

    /** @type {string} */
    scope;
    attributes;
    data() {
      return {
        scope: this.scope,
        type: this.type
      };
    }
    setup() {
      this.addActionHandler('save', () => this.actionSave());
      this.addActionHandler('close', () => this.actionClose());
      this.addActionHandler('resetToDefault', () => this.actionResetToDefault());
      this.addHandler('keydown.form', '', 'onKeyDown');
      this.scope = this.options.scope;
      this.type = this.options.type;
      if (!this.scope || !this.type) {
        throw Error("No scope or type.");
      }
      if (!this.getMetadata().get(['scopes', this.scope, 'customizable']) || this.getMetadata().get(`scopes.${this.scope}.entityManager.formula`) === false) {
        throw new Espo.Exceptions.NotFound("Entity type is not customizable.");
      }
      if (!['beforeSaveCustomScript', 'beforeSaveApiScript'].includes(this.type)) {
        Espo.Ui.error('No allowed formula type.', true);
        throw new Espo.Exceptions.NotFound('No allowed formula type specified.');
      }
      this.model = new _model.default();
      this.model.name = 'EntityManager';
      this.wait(this.loadFormula().then(() => {
        this.recordView = new _editFormula.default({
          model: this.model,
          targetEntityType: this.scope,
          type: this.type
        });
        this.assignView('record', this.recordView, '.record');
      }));
      this.listenTo(this.model, 'change', (m, o) => {
        if (!o.ui) {
          return;
        }
        this.setIsChanged();
      });
    }
    async loadFormula() {
      await Espo.Ajax.getRequest('Metadata/action/get', {
        key: 'formula.' + this.scope
      }).then(formulaData => {
        formulaData = formulaData || {};
        this.model.set(this.type, formulaData[this.type] || null);
        this.updateAttributes();
      });
    }
    afterRender() {
      this.$save = this.$el.find('[data-action="save"]');
    }
    disableButtons() {
      this.$save.addClass('disabled').attr('disabled', 'disabled');
    }
    enableButtons() {
      this.$save.removeClass('disabled').removeAttr('disabled');
    }
    updateAttributes() {
      this.attributes = Espo.Utils.clone(this.model.attributes);
    }
    actionSave() {
      let data = this.recordView.fetch();
      if (_underscore.default.isEqual(data, this.attributes)) {
        Espo.Ui.warning(this.translate('notModified', 'messages'));
        return;
      }
      if (this.recordView.validate()) {
        return;
      }
      this.disableButtons();
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('EntityManager/action/formula', {
        data: data,
        scope: this.scope
      }).then(() => {
        Espo.Ui.success(this.translate('Saved'));
        this.enableButtons();
        this.setIsNotChanged();
        this.updateAttributes();
      }).catch(() => this.enableButtons());
    }
    actionClose() {
      this.setIsNotChanged();
      this.getRouter().navigate('#Admin/entityManager/scope=' + this.scope, {
        trigger: true
      });
    }
    async actionResetToDefault() {
      await this.confirm(this.translate('confirmation', 'messages'));
      this.disableButtons();
      Espo.Ui.notify(' ... ');
      try {
        await Espo.Ajax.postRequest('EntityManager/action/resetFormulaToDefault', {
          scope: this.scope,
          type: this.type
        });
      } catch (e) {
        this.enableButtons();
        return;
      }
      await this.loadFormula();
      await this.recordView.reRender();
      this.enableButtons();
      this.setIsNotChanged();
      Espo.Ui.success(this.translate('Done'));
    }
    setConfirmLeaveOut(value) {
      this.getRouter().confirmLeaveOut = value;
    }
    setIsChanged() {
      this.isChanged = true;
      this.setConfirmLeaveOut(true);
    }
    setIsNotChanged() {
      this.isChanged = false;
      this.setConfirmLeaveOut(false);
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Formula', 'labels', 'EntityManager'));
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
      let key = Espo.Utils.getKeyFromKeyEvent(e);
      if (key === 'Control+KeyS' || key === 'Control+Enter') {
        this.actionSave();
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
  var _default = EntityManagerFormulaView;
  _exports.default = _default;
});

define("views/admin/entity-manager/edit", ["exports", "view", "model"], function (_exports, _view, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _model = _interopRequireDefault(_model);
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

  class EntityManagerEditView extends _view.default {
    template = 'admin/entity-manager/edit';

    /**
     * @type {{
     *     string: {
     *         fieldDefs: Object.<string, *>,
     *         location?: string,
     *     }
     * }}
     */
    additionalParams;
    defaultParamLocation = 'scopes';
    data() {
      return {
        isNew: this.isNew,
        scope: this.scope
      };
    }
    setupData() {
      const scope = this.scope;
      const templateType = this.getMetadata().get(['scopes', scope, 'type']) || null;
      this.hasStreamField = true;
      if (scope) {
        this.hasStreamField = this.getMetadata().get(['scopes', scope, 'customizable']) && this.getMetadata().get(['scopes', scope, 'object']) || false;
      }
      if (scope === 'User') {
        this.hasStreamField = false;
      }
      this.hasColorField = !this.getConfig().get('scopeColorsDisabled');
      if (scope) {
        this.additionalParams = Espo.Utils.cloneDeep({
          ...this.getMetadata().get(['app', 'entityManagerParams', 'Global']),
          ...this.getMetadata().get(['app', 'entityManagerParams', '@' + (templateType || '_')]),
          ...this.getMetadata().get(['app', 'entityManagerParams', scope])
        });
        this.model.set('name', scope);
        this.model.set('labelSingular', this.translate(scope, 'scopeNames'));
        this.model.set('labelPlural', this.translate(scope, 'scopeNamesPlural'));
        this.model.set('type', this.getMetadata().get('scopes.' + scope + '.type') || '');
        this.model.set('stream', this.getMetadata().get('scopes.' + scope + '.stream') || false);
        this.model.set('disabled', this.getMetadata().get('scopes.' + scope + '.disabled') || false);
        this.model.set('sortBy', this.getMetadata().get('entityDefs.' + scope + '.collection.orderBy'));
        this.model.set('sortDirection', this.getMetadata().get('entityDefs.' + scope + '.collection.order'));
        this.model.set('textFilterFields', this.getMetadata().get(['entityDefs', scope, 'collection', 'textFilterFields']) || ['name']);
        this.model.set('fullTextSearch', this.getMetadata().get(['entityDefs', scope, 'collection', 'fullTextSearch']) || false);
        this.model.set('countDisabled', this.getMetadata().get(['entityDefs', scope, 'collection', 'countDisabled']) || false);
        this.model.set('statusField', this.getMetadata().get('scopes.' + scope + '.statusField') || null);
        if (this.hasColorField) {
          this.model.set('color', this.getMetadata().get(['clientDefs', scope, 'color']) || null);
        }
        this.model.set('iconClass', this.getMetadata().get(['clientDefs', scope, 'iconClass']) || null);
        this.model.set('kanbanViewMode', this.getMetadata().get(['clientDefs', scope, 'kanbanViewMode']) || false);
        this.model.set('kanbanStatusIgnoreList', this.getMetadata().get(['scopes', scope, 'kanbanStatusIgnoreList']) || []);
        for (const param in this.additionalParams) {
          /** @type {{fieldDefs: Object, location?: string}} */
          const defs = this.additionalParams[param];
          const location = defs.location || this.defaultParamLocation;
          const defaultValue = defs.fieldDefs.type === 'bool' ? false : null;
          const value = this.getMetadata().get([location, scope, param]) || defaultValue;
          this.model.set(param, value);
        }
      }
      if (scope) {
        const fieldDefs = this.getMetadata().get('entityDefs.' + scope + '.fields') || {};
        this.orderableFieldList = Object.keys(fieldDefs).filter(item => {
          if (!this.getFieldManager().isEntityTypeFieldAvailable(scope, item)) {
            return false;
          }
          if (fieldDefs[item].notStorable) {
            return false;
          }
          return true;
        }).sort((v1, v2) => {
          return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
        });
        this.sortByTranslation = {};
        this.orderableFieldList.forEach(item => {
          this.sortByTranslation[item] = this.translate(item, 'fields', scope);
        });
        this.filtersOptionList = this.getTextFiltersOptionList(scope);
        this.textFilterFieldsTranslation = {};
        this.filtersOptionList.forEach(item => {
          if (~item.indexOf('.')) {
            const link = item.split('.')[0];
            const foreignField = item.split('.')[1];
            const foreignEntityType = this.getMetadata().get(['entityDefs', scope, 'links', link, 'entity']);
            this.textFilterFieldsTranslation[item] = this.translate(link, 'links', scope) + '.' + this.translate(foreignField, 'fields', foreignEntityType);
            return;
          }
          this.textFilterFieldsTranslation[item] = this.translate(item, 'fields', scope);
        });
        this.enumFieldList = Object.keys(fieldDefs).filter(item => {
          if (fieldDefs[item].disabled) {
            return;
          }
          if (fieldDefs[item].type === 'enum') {
            return true;
          }
        }).sort((v1, v2) => {
          return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
        });
        this.translatedStatusFields = {};
        this.enumFieldList.forEach(item => {
          this.translatedStatusFields[item] = this.translate(item, 'fields', scope);
        });
        this.enumFieldList.unshift('');
        this.translatedStatusFields[''] = '-' + this.translate('None') + '-';
        this.statusOptionList = [];
        this.translatedStatusOptions = {};
      }
      this.detailLayout = [{
        rows: [[{
          name: 'name'
        }, {
          name: 'type',
          options: {
            tooltipText: this.translate('entityType', 'tooltips', 'EntityManager')
          }
        }], [{
          name: 'labelSingular'
        }, {
          name: 'labelPlural'
        }], [{
          name: 'iconClass'
        }, {
          name: 'color'
        }], [{
          name: 'disabled'
        }, {
          name: 'stream'
        }], [{
          name: 'sortBy',
          options: {
            translatedOptions: this.sortByTranslation
          }
        }, {
          name: 'sortDirection'
        }], [{
          name: 'textFilterFields',
          options: {
            translatedOptions: this.textFilterFieldsTranslation
          }
        }, {
          name: 'statusField',
          options: {
            translatedOptions: this.translatedStatusFields
          }
        }], [{
          name: 'fullTextSearch'
        }, {
          name: 'countDisabled'
        }], [{
          name: 'kanbanViewMode'
        }, {
          name: 'kanbanStatusIgnoreList',
          options: {
            translatedOptions: this.translatedStatusOptions
          }
        }]]
      }];
      if (this.scope) {
        const rows1 = [];
        const rows2 = [];
        const paramList1 = Object.keys(this.additionalParams).filter(item => !!this.getMetadata().get(['app', 'entityManagerParams', 'Global', item]));
        const paramList2 = Object.keys(this.additionalParams).filter(item => !paramList1.includes(item));
        const add = function (rows, list) {
          list.forEach((param, i) => {
            if (i % 2 === 0) {
              rows.push([]);
            }
            const row = rows[rows.length - 1];
            row.push({
              name: param
            });
            if (i === list.length - 1 && row.length === 1) {
              row.push(false);
            }
          });
        };
        add(rows1, paramList1);
        add(rows2, paramList2);
        if (rows1.length) {
          this.detailLayout.push({
            rows: rows1
          });
        }
        if (rows2.length) {
          this.detailLayout.push({
            rows: rows2
          });
        }
      }
    }
    setup() {
      const scope = this.scope = this.options.scope || false;
      this.isNew = !scope;
      this.model = new _model.default();
      this.model.name = 'EntityManager';
      if (!this.isNew) {
        this.isCustom = this.getMetadata().get(['scopes', scope, 'isCustom']);
      }
      if (this.scope && (!this.getMetadata().get(`scopes.${scope}.customizable`) || this.getMetadata().get(`scopes.${scope}.entityManager.edit`) === false)) {
        throw new Espo.Exceptions.NotFound("The entity type is not customizable.");
      }
      this.setupData();
      this.setupDefs();
      this.model.fetchedAttributes = this.model.getClonedAttributes();
      this.createRecordView();
    }
    setupDefs() {
      const scope = this.scope;
      const defs = {
        fields: {
          type: {
            type: 'enum',
            required: true,
            options: this.getMetadata().get('app.entityTemplateList') || ['Base'],
            readOnly: scope !== false,
            tooltip: true
          },
          stream: {
            type: 'bool',
            required: true,
            tooltip: true
          },
          disabled: {
            type: 'bool',
            tooltip: true
          },
          name: {
            type: 'varchar',
            required: true,
            trim: true,
            maxLength: 64,
            readOnly: scope !== false
          },
          labelSingular: {
            type: 'varchar',
            required: true,
            trim: true
          },
          labelPlural: {
            type: 'varchar',
            required: true,
            trim: true
          },
          color: {
            type: 'varchar',
            view: 'views/fields/colorpicker'
          },
          iconClass: {
            type: 'varchar',
            view: 'views/admin/entity-manager/fields/icon-class'
          },
          sortBy: {
            type: 'enum',
            options: this.orderableFieldList
          },
          sortDirection: {
            type: 'enum',
            options: ['asc', 'desc']
          },
          fullTextSearch: {
            type: 'bool',
            tooltip: true
          },
          countDisabled: {
            type: 'bool',
            tooltip: true
          },
          kanbanViewMode: {
            type: 'bool'
          },
          textFilterFields: {
            type: 'multiEnum',
            options: this.filtersOptionList,
            tooltip: true
          },
          statusField: {
            type: 'enum',
            options: this.enumFieldList,
            tooltip: true
          },
          kanbanStatusIgnoreList: {
            type: 'multiEnum',
            options: this.statusOptionList
          }
        }
      };
      if (this.getMetadata().get(['scopes', this.scope, 'statusFieldLocked'])) {
        defs.fields.statusField.readOnly = true;
      }
      for (const param in this.additionalParams) {
        defs.fields[param] = this.additionalParams[param].fieldDefs;
      }
      this.model.setDefs(defs);
    }
    createRecordView() {
      return this.createView('record', 'views/admin/entity-manager/record/edit', {
        selector: '.record',
        model: this.model,
        detailLayout: this.detailLayout,
        isNew: this.isNew,
        hasColorField: this.hasColorField,
        hasStreamField: this.hasStreamField,
        isCustom: this.isCustom,
        subjectEntityType: this.scope,
        shortcutKeysEnabled: true
      }).then(view => {
        this.listenTo(view, 'save', () => this.actionSave());
        this.listenTo(view, 'cancel', () => this.actionCancel());
        this.listenTo(view, 'reset-to-default', () => this.actionResetToDefault());
      });
    }
    hideField(name) {
      this.getRecordView().hideField(name);
    }
    showField(name) {
      this.getRecordView().showField(name);
    }
    toPlural(string) {
      if (string.slice(-1) === 'y') {
        return string.substr(0, string.length - 1) + 'ies';
      }
      if (string.slice(-1) === 's') {
        return string + 'es';
      }
      return string + 's';
    }
    afterRender() {
      this.getFieldView('name').on('change', () => {
        let name = this.model.get('name');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        this.model.set('labelSingular', name);
        this.model.set('labelPlural', this.toPlural(name));
        if (name) {
          name = name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/[^\w\s]/gi, '').replace(/ (.)/g, (match, g) => {
            return g.toUpperCase();
          }).replace(' ', '');
          if (name.length) {
            name = name.charAt(0).toUpperCase() + name.slice(1);
          }
        }
        this.model.set('name', name);
      });
    }
    actionSave() {
      let fieldList = ['name', 'type', 'labelSingular', 'labelPlural', 'disabled', 'statusField', 'iconClass'];
      if (this.hasStreamField) {
        fieldList.push('stream');
      }
      if (this.scope) {
        fieldList.push('sortBy');
        fieldList.push('sortDirection');
        fieldList.push('kanbanViewMode');
        fieldList.push('kanbanStatusIgnoreList');
        fieldList = fieldList.concat(Object.keys(this.additionalParams));
      }
      if (this.hasColorField) {
        fieldList.push('color');
      }
      const fetchedAttributes = Espo.Utils.cloneDeep(this.model.fetchedAttributes) || {};
      let notValid = false;
      fieldList.forEach(item => {
        if (!this.getFieldView(item)) {
          return;
        }
        if (this.getFieldView(item).mode !== 'edit') {
          return;
        }
        this.getFieldView(item).fetchToModel();
      });
      fieldList.forEach(item => {
        if (!this.getFieldView(item)) {
          return;
        }
        if (this.getFieldView(item).mode !== 'edit') {
          return;
        }
        notValid = this.getFieldView(item).validate() || notValid;
      });
      if (notValid) {
        return;
      }
      this.disableButtons();
      let url = 'EntityManager/action/createEntity';
      if (this.scope) {
        url = 'EntityManager/action/updateEntity';
      }
      const name = this.model.get('name');
      const data = {
        name: name,
        labelSingular: this.model.get('labelSingular'),
        labelPlural: this.model.get('labelPlural'),
        type: this.model.get('type'),
        stream: this.model.get('stream'),
        disabled: this.model.get('disabled'),
        textFilterFields: this.model.get('textFilterFields'),
        fullTextSearch: this.model.get('fullTextSearch'),
        countDisabled: this.model.get('countDisabled'),
        statusField: this.model.get('statusField'),
        iconClass: this.model.get('iconClass')
      };
      if (this.hasColorField) {
        data.color = this.model.get('color') || null;
      }
      if (data.statusField === '') {
        data.statusField = null;
      }
      if (this.scope) {
        data.sortBy = this.model.get('sortBy');
        data.sortDirection = this.model.get('sortDirection');
        data.kanbanViewMode = this.model.get('kanbanViewMode');
        data.kanbanStatusIgnoreList = this.model.get('kanbanStatusIgnoreList');
        for (const param in this.additionalParams) {
          const type = this.additionalParams[param].fieldDefs.type;
          this.getFieldManager().getAttributeList(type, param).forEach(attribute => {
            data[attribute] = this.model.get(attribute);
          });
        }
      }
      if (!this.isNew) {
        if (this.model.fetchedAttributes.labelPlural === data.labelPlural) {
          delete data.labelPlural;
        }
        if (this.model.fetchedAttributes.labelSingular === data.labelSingular) {
          delete data.labelSingular;
        }
      }
      Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
      Espo.Ajax.postRequest(url, data).then(() => {
        this.model.fetchedAttributes = this.model.getClonedAttributes();
        this.scope ? Espo.Ui.success(this.translate('Saved')) : Espo.Ui.success(this.translate('entityCreated', 'messages', 'EntityManager'));
        this.getMetadata().loadSkipCache().then(() => Promise.all([this.getConfig().load(), this.getLanguage().loadSkipCache()])).then(() => {
          const rebuildRequired = data.fullTextSearch && !fetchedAttributes.fullTextSearch;
          this.broadcastUpdate();
          if (rebuildRequired) {
            this.createView('dialog', 'views/modal', {
              templateContent: "{{complexText viewObject.options.msg}}" + "{{complexText viewObject.options.msgRebuild}}",
              headerText: this.translate('rebuildRequired', 'strings', 'Admin'),
              backdrop: 'static',
              msg: this.translate('rebuildRequired', 'messages', 'Admin'),
              msgRebuild: '```php rebuild.php```',
              buttonList: [{
                name: 'close',
                label: this.translate('Close')
              }]
            }).then(view => view.render());
          }
          this.enableButtons();
          this.getRecordView().setIsNotChanged();
          if (this.isNew) {
            this.getRouter().navigate('#Admin/entityManager/scope=' + name, {
              trigger: true
            });
          }
        });
      }).catch(() => {
        this.enableButtons();
      });
    }
    actionCancel() {
      this.getRecordView().setConfirmLeaveOut(false);
      if (!this.isNew) {
        this.getRouter().navigate('#Admin/entityManager/scope=' + this.scope, {
          trigger: true
        });
        return;
      }
      this.getRouter().navigate('#Admin/entityManager', {
        trigger: true
      });
    }
    actionResetToDefault() {
      this.confirm(this.translate('confirmation', 'messages'), () => {
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
        this.disableButtons();
        Espo.Ajax.postRequest('EntityManager/action/resetToDefault', {
          scope: this.scope
        }).then(() => {
          this.getMetadata().loadSkipCache().then(() => this.getLanguage().loadSkipCache()).then(() => {
            this.setupData();
            this.model.fetchedAttributes = this.model.getClonedAttributes();
            Espo.Ui.success(this.translate('Done'));
            this.enableButtons();
            this.broadcastUpdate();
            this.getRecordView().setIsNotChanged();
          });
        });
      });
    }

    /**
     * @return {module:views/record/edit}
     */
    getRecordView() {
      return this.getView('record');
    }
    getTextFiltersOptionList(scope) {
      const fieldDefs = this.getMetadata().get(['entityDefs', scope, 'fields']) || {};
      const filtersOptionList = Object.keys(fieldDefs).filter(item => {
        const fieldType = fieldDefs[item].type;
        if (!this.getMetadata().get(['fields', fieldType, 'textFilter'])) {
          return false;
        }
        if (!this.getFieldManager().isEntityTypeFieldAvailable(scope, item)) {
          return false;
        }
        if (this.getMetadata().get(['entityDefs', scope, 'fields', item, 'textFilterDisabled'])) {
          return false;
        }
        return true;
      });
      filtersOptionList.unshift('id');
      const linkList = Object.keys(this.getMetadata().get(['entityDefs', scope, 'links']) || {});
      linkList.sort((v1, v2) => {
        return this.translate(v1, 'links', scope).localeCompare(this.translate(v2, 'links', scope));
      });
      linkList.forEach(link => {
        const linkType = this.getMetadata().get(['entityDefs', scope, 'links', link, 'type']);
        if (linkType !== 'belongsTo') {
          return;
        }
        const foreignEntityType = this.getMetadata().get(['entityDefs', scope, 'links', link, 'entity']);
        if (!foreignEntityType) {
          return;
        }
        if (foreignEntityType === 'Attachment') {
          return;
        }
        const fields = this.getMetadata().get(['entityDefs', foreignEntityType, 'fields']) || {};
        const fieldList = Object.keys(fields);
        fieldList.sort((v1, v2) => {
          return this.translate(v1, 'fields', foreignEntityType).localeCompare(this.translate(v2, 'fields', foreignEntityType));
        });
        fieldList.filter(item => {
          const fieldType = this.getMetadata().get(['entityDefs', foreignEntityType, 'fields', item, 'type']);
          if (!this.getMetadata().get(['fields', fieldType, 'textFilter'])) {
            return false;
          }
          if (!this.getMetadata().get(['fields', fieldType, 'textFilterForeign'])) {
            return false;
          }
          if (!this.getFieldManager().isEntityTypeFieldAvailable(foreignEntityType, item)) {
            return false;
          }
          if (this.getMetadata().get(['entityDefs', foreignEntityType, 'fields', item, 'textFilterDisabled'])) {
            return false;
          }
          if (this.getMetadata().get(['entityDefs', foreignEntityType, 'fields', item, 'foreignAccessDisabled'])) {
            return false;
          }
          return true;
        }).forEach(item => {
          filtersOptionList.push(link + '.' + item);
        });
      });
      return filtersOptionList;
    }
    getFieldView(name) {
      return this.getRecordView().getFieldView(name);
    }
    disableButtons() {
      this.getRecordView().disableActionItems();
    }
    enableButtons() {
      this.getRecordView().enableActionItems();
    }
    broadcastUpdate() {
      this.getHelper().broadcastChannel.postMessage('update:metadata');
      this.getHelper().broadcastChannel.postMessage('update:language');
      this.getHelper().broadcastChannel.postMessage('update:config');
    }
  }
  var _default = EntityManagerEditView;
  _exports.default = _default;
});

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

define('views/admin/entity-manager/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        bottomView: null,
        sideView: null,

        dropdownItemList: [],

        accessControlDisabled: true,
        saveAndContinueEditingAction: false,
        saveAndNewAction: false,

        shortcutKeys: {
            'Control+Enter': 'save',
            'Control+KeyS': 'save',
        },

        setup: function () {
            this.isCreate = this.options.isNew;

            this.scope = 'EntityManager';

            this.subjectEntityType = this.options.subjectEntityType;

            if (!this.isCreate) {
                this.buttonList = [
                    {
                        name: 'save',
                        style: 'danger',
                        label: 'Save',
                    },
                    {
                        name: 'cancel',
                        label: 'Cancel',
                    },
                ];
            }
            else {
                this.buttonList = [
                    {
                        name: 'save',
                        style: 'danger',
                        label: 'Create',
                    },
                    {
                        name: 'cancel',
                        label: 'Cancel',
                    },
                ];
            }

            if (!this.isCreate && !this.options.isCustom) {
                this.buttonList.push({
                    name: 'resetToDefault',
                    text: this.translate('Reset to Default', 'labels', 'Admin'),
                });
            }

            Dep.prototype.setup.call(this);

            if (this.isCreate) {
                this.hideField('sortBy');
                this.hideField('sortDirection');
                this.hideField('textFilterFields');
                this.hideField('statusField');
                this.hideField('fullTextSearch');
                this.hideField('countDisabled');
                this.hideField('kanbanViewMode');
                this.hideField('kanbanStatusIgnoreList');
                this.hideField('disabled');
            }

            if (!this.options.hasColorField) {
                this.hideField('color');
            }

            if (!this.options.hasStreamField) {
                this.hideField('stream');
            }

            if (!this.isCreate) {
                this.manageKanbanFields({});

                this.listenTo(this.model, 'change:statusField', (m, v, o) => {
                    this.manageKanbanFields(o);
                });

                this.manageKanbanViewModeField();

                this.listenTo(this.model, 'change:kanbanViewMode', () => {
                    this.manageKanbanViewModeField();
                });
            }
        },

        actionSave: function () {
            this.trigger('save');
        },

        actionCancel: function () {
            this.trigger('cancel');
        },

        actionResetToDefault: function () {
            this.trigger('reset-to-default');
        },

        manageKanbanViewModeField: function () {
            if (this.model.get('kanbanViewMode')) {
                this.showField('kanbanStatusIgnoreList');
            } else {
                this.hideField('kanbanStatusIgnoreList');
            }
        },

        manageKanbanFields: function (o) {
            if (o.ui) {
                this.model.set('kanbanStatusIgnoreList', []);
            }

            if (this.model.get('statusField')) {
                this.setKanbanStatusIgnoreListOptions();

                this.showField('kanbanViewMode');

                if (this.model.get('kanbanViewMode')) {
                    this.showField('kanbanStatusIgnoreList');
                } else {
                    this.hideField('kanbanStatusIgnoreList');
                }
            }
            else {
                this.hideField('kanbanViewMode');
                this.hideField('kanbanStatusIgnoreList');
            }
        },

        setKanbanStatusIgnoreListOptions: function () {
            let statusField = this.model.get('statusField');

            var optionList = this.getMetadata()
                .get(['entityDefs', this.subjectEntityType, 'fields', statusField, 'options']) || [];

            this.setFieldOptionList('kanbanStatusIgnoreList', optionList);

            let fieldView = this.getFieldView('kanbanStatusIgnoreList');

            if (!fieldView) {
                this.once('after:render', () => this.setKanbanStatusIgnoreListTranslation());

                return;
            }

            this.setKanbanStatusIgnoreListTranslation();
        },

        setKanbanStatusIgnoreListTranslation: function () {
            var fieldView = this.getFieldView('kanbanStatusIgnoreList');

            var statusField = this.model.get('statusField');

            var translation = this.getMetadata()
                .get(['entityDefs', this.subjectEntityType, 'fields', statusField, 'translation']) ||
                this.subjectEntityType + '.options.' + statusField;

            fieldView.params.translation = translation;
            fieldView.setupTranslation();
        },
    });
});

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

define('views/admin/entity-manager/modals/select-icon', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'admin/entity-manager/modals/select-icon',

        buttonList: [
            {
                name: 'cancel',
                label: 'Cancel'
            }
        ],

        data: function () {
            return {
                iconDataList: this.getIconDataList()
            };
        },

        setup: function () {
            this.events['keyup input[data-name="quick-search"]'] = function (e) {
                this.processQuickSearch(e.currentTarget.value);
            };

            this.itemCache = {};

            this.iconList = ["fas fa-ad","fas fa-address-book","fas fa-address-card","fas fa-adjust","fas fa-air-freshener",
                "fas fa-align-center","fas fa-align-justify","fas fa-align-left","fas fa-align-right","fas fa-allergies",
                "fas fa-ambulance","fas fa-american-sign-language-interpreting","fas fa-anchor","fas fa-angle-double-down",
                "fas fa-angle-double-left","fas fa-angle-double-right","fas fa-angle-double-up","fas fa-angle-down",
                "fas fa-angle-left","fas fa-angle-right","fas fa-angle-up","fas fa-angry","fas fa-ankh","fas fa-apple-alt",
                "fas fa-archive","fas fa-archway","fas fa-arrow-alt-circle-down","fas fa-arrow-alt-circle-left",
                "fas fa-arrow-alt-circle-right","fas fa-arrow-alt-circle-up","fas fa-arrow-circle-down",
                "fas fa-arrow-circle-left","fas fa-arrow-circle-right","fas fa-arrow-circle-up",
                "fas fa-arrow-down","fas fa-arrow-left","fas fa-arrow-right","fas fa-arrow-up",
                "fas fa-arrows-alt","fas fa-arrows-alt-h","fas fa-arrows-alt-v","fas fa-assistive-listening-systems",
                "fas fa-asterisk","fas fa-at","fas fa-atlas","fas fa-atom","fas fa-audio-description",
                "fas fa-award","fas fa-baby","fas fa-baby-carriage","fas fa-backspace","fas fa-backward",
                "fas fa-balance-scale","fas fa-ban","fas fa-band-aid","fas fa-barcode","fas fa-bars",
                "fas fa-baseball-ball","fas fa-basketball-ball","fas fa-bath","fas fa-battery-empty",
                "fas fa-battery-full","fas fa-battery-half","fas fa-battery-quarter",
                "fas fa-battery-three-quarters","fas fa-bed","fas fa-beer","fas fa-bell","fas fa-bell-slash",
                "fas fa-bezier-curve","fas fa-bible","fas fa-bicycle","fas fa-binoculars","fas fa-biohazard",
                "fas fa-birthday-cake","fas fa-blender","fas fa-blender-phone","fas fa-blind","fas fa-blog",
                "fas fa-bold","fas fa-bolt","fas fa-bomb","fas fa-bone","fas fa-bong","fas fa-book",
                "fas fa-book-dead","fas fa-book-open","fas fa-book-reader","fas fa-bookmark",
                "fas fa-bowling-ball","fas fa-box","fas fa-box-open","fas fa-boxes","fas fa-braille","fas fa-brain",
                "fas fa-briefcase","fas fa-briefcase-medical","fas fa-broadcast-tower","fas fa-broom","fas fa-brush",
                "fas fa-bug","fas fa-building","fas fa-bullhorn","fas fa-bullseye","fas fa-burn","fas fa-bus",
                "fas fa-bus-alt","fas fa-business-time","fas fa-calculator","fas fa-calendar","fas fa-calendar-alt",
                "fas fa-calendar-check","fas fa-calendar-day","fas fa-calendar-minus","fas fa-calendar-plus",
                "fas fa-calendar-times","fas fa-calendar-week","fas fa-camera","fas fa-camera-retro",
                "fas fa-campground","fas fa-candy-cane","fas fa-cannabis","fas fa-capsules","fas fa-car",
                "fas fa-car-alt","fas fa-car-battery","fas fa-car-crash","fas fa-car-side","fas fa-caret-down",
                "fas fa-caret-left","fas fa-caret-right","fas fa-caret-square-down","fas fa-caret-square-left",
                "fas fa-caret-square-right","fas fa-caret-square-up","fas fa-caret-up","fas fa-carrot",
                "fas fa-cart-arrow-down","fas fa-cart-plus","fas fa-cash-register","fas fa-cat","fas fa-certificate",
                "fas fa-chair","fas fa-chalkboard","fas fa-chalkboard-teacher","fas fa-charging-station",
                "fas fa-chart-area","fas fa-chart-bar","fas fa-chart-line","fas fa-chart-pie","fas fa-check",
                "fas fa-check-circle","fas fa-check-double","fas fa-check-square","fas fa-chess","fas fa-chess-bishop",
                "fas fa-chess-board","fas fa-chess-king","fas fa-chess-knight","fas fa-chess-pawn",
                "fas fa-chess-queen","fas fa-chess-rook","fas fa-chevron-circle-down","fas fa-chevron-circle-left",
                "fas fa-chevron-circle-right","fas fa-chevron-circle-up","fas fa-chevron-down",
                "fas fa-chevron-left","fas fa-chevron-right","fas fa-chevron-up","fas fa-child","fas fa-church",
                "fas fa-circle","fas fa-circle-notch","fas fa-city","fas fa-clipboard","fas fa-clipboard-check",
                "fas fa-clipboard-list","fas fa-clock","fas fa-clone","fas fa-closed-captioning","fas fa-cloud",
                "fas fa-cloud-download-alt","fas fa-cloud-meatball","fas fa-cloud-moon","fas fa-cloud-moon-rain",
                "fas fa-cloud-rain","fas fa-cloud-showers-heavy","fas fa-cloud-sun","fas fa-cloud-sun-rain",
                "fas fa-cloud-upload-alt","fas fa-cocktail","fas fa-code","fas fa-code-branch","fas fa-coffee",
                "fas fa-cog","fas fa-cogs","fas fa-coins","fas fa-columns","fas fa-comment","fas fa-comment-alt",
                "fas fa-comment-dollar","fas fa-comment-dots","fas fa-comment-slash","fas fa-comments",
                "fas fa-comments-dollar","fas fa-compact-disc","fas fa-compass","fas fa-compress",
                "fas fa-compress-arrows-alt","fas fa-concierge-bell","fas fa-cookie","fas fa-cookie-bite",
                "fas fa-copy","fas fa-copyright","fas fa-couch","fas fa-credit-card","fas fa-crop",
                "fas fa-crop-alt","fas fa-cross","fas fa-crosshairs","fas fa-crow","fas fa-crown","fas fa-cube",
                "fas fa-cubes","fas fa-cut","fas fa-database","fas fa-deaf","fas fa-democrat","fas fa-desktop",
                "fas fa-dharmachakra","fas fa-diagnoses","fas fa-dice","fas fa-dice-d20","fas fa-dice-d6",
                "fas fa-dice-five","fas fa-dice-four","fas fa-dice-one","fas fa-dice-six","fas fa-dice-three","fas fa-dice-two","fas fa-digital-tachograph","fas fa-directions","fas fa-divide","fas fa-dizzy","fas fa-dna","fas fa-dog","fas fa-dollar-sign","fas fa-dolly","fas fa-dolly-flatbed","fas fa-donate","fas fa-door-closed","fas fa-door-open","fas fa-dot-circle","fas fa-dove","fas fa-download","fas fa-drafting-compass","fas fa-dragon","fas fa-draw-polygon","fas fa-drum","fas fa-drum-steelpan","fas fa-drumstick-bite","fas fa-dumbbell","fas fa-dumpster","fas fa-dumpster-fire","fas fa-dungeon","fas fa-edit","fas fa-eject","fas fa-ellipsis-h","fas fa-ellipsis-v","fas fa-envelope","fas fa-envelope-open","fas fa-envelope-open-text","fas fa-envelope-square","fas fa-equals","fas fa-eraser","fas fa-ethernet","fas fa-euro-sign","fas fa-exchange-alt","fas fa-exclamation","fas fa-exclamation-circle","fas fa-exclamation-triangle","fas fa-expand","fas fa-expand-arrows-alt","fas fa-external-link-alt","fas fa-external-link-square-alt","fas fa-eye","fas fa-eye-dropper","fas fa-eye-slash","fas fa-fast-backward","fas fa-fast-forward","fas fa-fax","fas fa-feather","fas fa-feather-alt","fas fa-female","fas fa-fighter-jet","fas fa-file","fas fa-file-alt","fas fa-file-archive","fas fa-file-audio","fas fa-file-code","fas fa-file-contract","fas fa-file-csv","fas fa-file-download","fas fa-file-excel","fas fa-file-export","fas fa-file-image","fas fa-file-import","fas fa-file-invoice","fas fa-file-invoice-dollar","fas fa-file-medical","fas fa-file-medical-alt","fas fa-file-pdf","fas fa-file-powerpoint","fas fa-file-prescription","fas fa-file-signature","fas fa-file-upload","fas fa-file-video","fas fa-file-word","fas fa-fill","fas fa-fill-drip","fas fa-film","fas fa-filter","fas fa-fingerprint","fas fa-fire","fas fa-fire-extinguisher","fas fa-first-aid","fas fa-fish","fas fa-fist-raised","fas fa-flag","fas fa-flag-checkered","fas fa-flag-usa","fas fa-flask","fas fa-flushed","fas fa-folder","fas fa-folder-minus","fas fa-folder-open","fas fa-folder-plus","fas fa-font","fas fa-football-ball","fas fa-forward","fas fa-frog","fas fa-frown","fas fa-frown-open","fas fa-funnel-dollar","fas fa-futbol","fas fa-gamepad","fas fa-gas-pump","fas fa-gavel","fas fa-gem","fas fa-genderless","fas fa-ghost","fas fa-gift","fas fa-gifts","fas fa-glass-cheers","fas fa-glass-martini","fas fa-glass-martini-alt","fas fa-glass-whiskey","fas fa-glasses","fas fa-globe","fas fa-globe-africa","fas fa-globe-americas","fas fa-globe-asia","fas fa-globe-europe","fas fa-golf-ball","fas fa-gopuram","fas fa-graduation-cap","fas fa-greater-than","fas fa-greater-than-equal","fas fa-grimace","fas fa-grin","fas fa-grin-alt","fas fa-grin-beam","fas fa-grin-beam-sweat","fas fa-grin-hearts","fas fa-grin-squint","fas fa-grin-squint-tears","fas fa-grin-stars","fas fa-grin-tears","fas fa-grin-tongue","fas fa-grin-tongue-squint","fas fa-grin-tongue-wink","fas fa-grin-wink","fas fa-grip-horizontal","fas fa-grip-lines","fas fa-grip-lines-vertical","fas fa-grip-vertical","fas fa-guitar","fas fa-h-square","fas fa-hammer","fas fa-hamsa","fas fa-hand-holding","fas fa-hand-holding-heart","fas fa-hand-holding-usd","fas fa-hand-lizard","fas fa-hand-paper","fas fa-hand-peace","fas fa-hand-point-down","fas fa-hand-point-left","fas fa-hand-point-right","fas fa-hand-point-up","fas fa-hand-pointer","fas fa-hand-rock","fas fa-hand-scissors","fas fa-hand-spock","fas fa-hands","fas fa-hands-helping","fas fa-handshake","fas fa-hanukiah","fas fa-hashtag","fas fa-hat-wizard","fas fa-haykal","fas fa-hdd","fas fa-heading","fas fa-headphones","fas fa-headphones-alt","fas fa-headset","fas fa-heart","fas fa-heart-broken","fas fa-heartbeat","fas fa-helicopter","fas fa-highlighter","fas fa-hiking","fas fa-hippo","fas fa-history","fas fa-hockey-puck","fas fa-holly-berry","fas fa-home","fas fa-horse","fas fa-horse-head","fas fa-hospital","fas fa-hospital-alt","fas fa-hospital-symbol","fas fa-hot-tub","fas fa-hotel","fas fa-hourglass","fas fa-hourglass-end","fas fa-hourglass-half","fas fa-hourglass-start","fas fa-house-damage","fas fa-hryvnia","fas fa-i-cursor","fas fa-icicles","fas fa-id-badge","fas fa-id-card","fas fa-id-card-alt","fas fa-igloo","fas fa-image","fas fa-images","fas fa-inbox","fas fa-indent","fas fa-industry","fas fa-infinity","fas fa-info","fas fa-info-circle","fas fa-italic","fas fa-jedi","fas fa-joint","fas fa-journal-whills","fas fa-kaaba","fas fa-key","fas fa-keyboard","fas fa-khanda","fas fa-kiss","fas fa-kiss-beam","fas fa-kiss-wink-heart","fas fa-kiwi-bird","fas fa-landmark","fas fa-language","fas fa-laptop","fas fa-laptop-code","fas fa-laugh","fas fa-laugh-beam","fas fa-laugh-squint","fas fa-laugh-wink","fas fa-layer-group","fas fa-leaf","fas fa-lemon","fas fa-less-than","fas fa-less-than-equal","fas fa-level-down-alt","fas fa-level-up-alt","fas fa-life-ring","fas fa-lightbulb","fas fa-link","fas fa-lira-sign","fas fa-list","fas fa-list-alt","fas fa-list-ol","fas fa-list-ul","fas fa-location-arrow","fas fa-lock","fas fa-lock-open","fas fa-long-arrow-alt-down","fas fa-long-arrow-alt-left","fas fa-long-arrow-alt-right","fas fa-long-arrow-alt-up","fas fa-low-vision","fas fa-luggage-cart","fas fa-magic","fas fa-magnet","fas fa-mail-bulk","fas fa-male","fas fa-map","fas fa-map-marked","fas fa-map-marked-alt","fas fa-map-marker","fas fa-map-marker-alt","fas fa-map-pin","fas fa-map-signs","fas fa-marker","fas fa-mars","fas fa-mars-double","fas fa-mars-stroke","fas fa-mars-stroke-h","fas fa-mars-stroke-v","fas fa-mask","fas fa-medal","fas fa-medkit","fas fa-meh","fas fa-meh-blank","fas fa-meh-rolling-eyes","fas fa-memory","fas fa-menorah","fas fa-mercury","fas fa-meteor","fas fa-microchip","fas fa-microphone","fas fa-microphone-alt","fas fa-microphone-alt-slash","fas fa-microphone-slash","fas fa-microscope","fas fa-minus","fas fa-minus-circle","fas fa-minus-square","fas fa-mitten","fas fa-mobile","fas fa-mobile-alt","fas fa-money-bill","fas fa-money-bill-alt","fas fa-money-bill-wave","fas fa-money-bill-wave-alt","fas fa-money-check","fas fa-money-check-alt","fas fa-monument","fas fa-moon","fas fa-mortar-pestle","fas fa-mosque","fas fa-motorcycle","fas fa-mountain","fas fa-mouse-pointer","fas fa-mug-hot","fas fa-music","fas fa-network-wired","fas fa-neuter","fas fa-newspaper","fas fa-not-equal","fas fa-notes-medical","fas fa-object-group","fas fa-object-ungroup","fas fa-oil-can","fas fa-om","fas fa-otter","fas fa-outdent","fas fa-paint-brush","fas fa-paint-roller","fas fa-palette","fas fa-pallet","fas fa-paper-plane","fas fa-paperclip","fas fa-parachute-box","fas fa-paragraph","fas fa-parking","fas fa-passport","fas fa-pastafarianism","fas fa-paste","fas fa-pause","fas fa-pause-circle","fas fa-paw","fas fa-peace","fas fa-pen","fas fa-pen-alt","fas fa-pen-fancy","fas fa-pen-nib","fas fa-pen-square","fas fa-pencil-alt","fas fa-pencil-ruler","fas fa-people-carry","fas fa-percent","fas fa-percentage","fas fa-person-booth","fas fa-phone","fas fa-phone-slash","fas fa-phone-square","fas fa-phone-volume","fas fa-piggy-bank","fas fa-pills","fas fa-place-of-worship","fas fa-plane","fas fa-plane-arrival","fas fa-plane-departure","fas fa-play","fas fa-play-circle","fas fa-plug","fas fa-plus","fas fa-plus-circle","fas fa-plus-square","fas fa-podcast","fas fa-poll","fas fa-poll-h","fas fa-poo","fas fa-poo-storm","fas fa-poop","fas fa-portrait","fas fa-pound-sign","fas fa-power-off","fas fa-pray","fas fa-praying-hands","fas fa-prescription","fas fa-prescription-bottle","fas fa-prescription-bottle-alt","fas fa-print","fas fa-procedures","fas fa-project-diagram","fas fa-puzzle-piece","fas fa-qrcode","fas fa-question","fas fa-question-circle","fas fa-quidditch","fas fa-quote-left","fas fa-quote-right","fas fa-quran","fas fa-radiation","fas fa-radiation-alt","fas fa-rainbow","fas fa-random","fas fa-receipt","fas fa-recycle","fas fa-redo","fas fa-redo-alt","fas fa-registered","fas fa-reply","fas fa-reply-all","fas fa-republican","fas fa-restroom","fas fa-retweet","fas fa-ribbon","fas fa-ring","fas fa-road","fas fa-robot","fas fa-rocket","fas fa-route","fas fa-rss","fas fa-rss-square","fas fa-ruble-sign","fas fa-ruler","fas fa-ruler-combined","fas fa-ruler-horizontal","fas fa-ruler-vertical","fas fa-running","fas fa-rupee-sign","fas fa-sad-cry","fas fa-sad-tear","fas fa-satellite","fas fa-satellite-dish","fas fa-save","fas fa-school","fas fa-screwdriver","fas fa-scroll","fas fa-sd-card","fas fa-search","fas fa-search-dollar","fas fa-search-location","fas fa-search-minus","fas fa-search-plus","fas fa-seedling","fas fa-server","fas fa-shapes","fas fa-share","fas fa-share-alt","fas fa-share-alt-square","fas fa-share-square","fas fa-shekel-sign","fas fa-shield-alt","fas fa-ship","fas fa-shipping-fast","fas fa-shoe-prints","fas fa-shopping-bag","fas fa-shopping-basket","fas fa-shopping-cart","fas fa-shower","fas fa-shuttle-van","fas fa-sign","fas fa-sign-in-alt","fas fa-sign-language","fas fa-sign-out-alt","fas fa-signal","fas fa-signature","fas fa-sim-card","fas fa-sitemap","fas fa-skating","fas fa-skiing","fas fa-skiing-nordic","fas fa-skull","fas fa-skull-crossbones","fas fa-slash","fas fa-sleigh","fas fa-sliders-h","fas fa-smile","fas fa-smile-beam","fas fa-smile-wink","fas fa-smog","fas fa-smoking","fas fa-smoking-ban","fas fa-sms","fas fa-snowboarding","fas fa-snowflake","fas fa-snowman","fas fa-snowplow","fas fa-socks","fas fa-solar-panel","fas fa-sort","fas fa-sort-alpha-down","fas fa-sort-alpha-up","fas fa-sort-amount-down","fas fa-sort-amount-up","fas fa-sort-down","fas fa-sort-numeric-down","fas fa-sort-numeric-up","fas fa-sort-up","fas fa-spa","fas fa-space-shuttle","fas fa-spider","fas fa-spinner","fas fa-splotch","fas fa-spray-can","fas fa-square","fas fa-square-full","fas fa-square-root-alt","fas fa-stamp","fas fa-star","fas fa-star-and-crescent","fas fa-star-half","fas fa-star-half-alt","fas fa-star-of-david","fas fa-star-of-life","fas fa-step-backward","fas fa-step-forward","fas fa-stethoscope","fas fa-sticky-note","fas fa-stop","fas fa-stop-circle","fas fa-stopwatch","fas fa-store","fas fa-store-alt","fas fa-stream","fas fa-street-view","fas fa-strikethrough","fas fa-stroopwafel","fas fa-subscript","fas fa-subway","fas fa-suitcase","fas fa-suitcase-rolling","fas fa-sun","fas fa-superscript","fas fa-surprise","fas fa-swatchbook","fas fa-swimmer","fas fa-swimming-pool","fas fa-synagogue","fas fa-sync","fas fa-sync-alt","fas fa-syringe","fas fa-table","fas fa-table-tennis","fas fa-tablet","fas fa-tablet-alt","fas fa-tablets","fas fa-tachometer-alt","fas fa-tag","fas fa-tags","fas fa-tape","fas fa-tasks","fas fa-taxi","fas fa-teeth","fas fa-teeth-open","fas fa-temperature-high","fas fa-temperature-low","fas fa-tenge","fas fa-terminal","fas fa-text-height","fas fa-text-width","fas fa-th","fas fa-th-large","fas fa-th-list","fas fa-theater-masks","fas fa-thermometer","fas fa-thermometer-empty","fas fa-thermometer-full","fas fa-thermometer-half","fas fa-thermometer-quarter","fas fa-thermometer-three-quarters","fas fa-thumbs-down","fas fa-thumbs-up","fas fa-thumbtack","fas fa-ticket-alt","fas fa-times","fas fa-times-circle","fas fa-tint","fas fa-tint-slash","fas fa-tired","fas fa-toggle-off","fas fa-toggle-on","fas fa-toilet","fas fa-toilet-paper","fas fa-toolbox","fas fa-tools","fas fa-tooth","fas fa-torah","fas fa-torii-gate","fas fa-tractor","fas fa-trademark","fas fa-traffic-light","fas fa-train","fas fa-tram","fas fa-transgender","fas fa-transgender-alt","fas fa-trash","fas fa-trash-alt","fas fa-tree","fas fa-trophy","fas fa-truck","fas fa-truck-loading","fas fa-truck-monster","fas fa-truck-moving","fas fa-truck-pickup","fas fa-tshirt","fas fa-tty","fas fa-tv","fas fa-umbrella","fas fa-umbrella-beach","fas fa-underline","fas fa-undo","fas fa-undo-alt","fas fa-universal-access","fas fa-university","fas fa-unlink","fas fa-unlock","fas fa-unlock-alt","fas fa-upload","fas fa-user","fas fa-user-alt","fas fa-user-alt-slash","fas fa-user-astronaut","fas fa-user-check","fas fa-user-circle","fas fa-user-clock","fas fa-user-cog","fas fa-user-edit","fas fa-user-friends","fas fa-user-graduate","fas fa-user-injured","fas fa-user-lock","fas fa-user-md","fas fa-user-minus","fas fa-user-ninja","fas fa-user-plus","fas fa-user-secret","fas fa-user-shield","fas fa-user-slash","fas fa-user-tag","fas fa-user-tie","fas fa-user-times","fas fa-users","fas fa-users-cog","fas fa-utensil-spoon","fas fa-utensils","fas fa-vector-square","fas fa-venus","fas fa-venus-double","fas fa-venus-mars","fas fa-vial","fas fa-vials","fas fa-video","fas fa-video-slash","fas fa-vihara","fas fa-volleyball-ball","fas fa-volume-down","fas fa-volume-mute","fas fa-volume-off","fas fa-volume-up","fas fa-vote-yea","fas fa-vr-cardboard","fas fa-walking","fas fa-wallet","fas fa-warehouse","fas fa-water","fas fa-weight","fas fa-weight-hanging","fas fa-wheelchair","fas fa-wifi","fas fa-wind","fas fa-window-close","fas fa-window-maximize","fas fa-window-minimize","fas fa-window-restore","fas fa-wine-bottle","fas fa-wine-glass","fas fa-wine-glass-alt","fas fa-won-sign","fas fa-wrench","fas fa-x-ray","fas fa-yen-sign","fas fa-yin-yang","far fa-address-book","far fa-address-card","far fa-angry","far fa-arrow-alt-circle-down","far fa-arrow-alt-circle-left","far fa-arrow-alt-circle-right","far fa-arrow-alt-circle-up","far fa-bell","far fa-bell-slash","far fa-bookmark","far fa-building","far fa-calendar","far fa-calendar-alt","far fa-calendar-check","far fa-calendar-minus","far fa-calendar-plus","far fa-calendar-times","far fa-caret-square-down","far fa-caret-square-left","far fa-caret-square-right","far fa-caret-square-up","far fa-chart-bar","far fa-check-circle","far fa-check-square","far fa-circle","far fa-clipboard","far fa-clock","far fa-clone","far fa-closed-captioning","far fa-comment","far fa-comment-alt","far fa-comment-dots","far fa-comments","far fa-compass","far fa-copy","far fa-copyright","far fa-credit-card","far fa-dizzy","far fa-dot-circle","far fa-edit","far fa-envelope","far fa-envelope-open","far fa-eye","far fa-eye-slash","far fa-file","far fa-file-alt","far fa-file-archive","far fa-file-audio","far fa-file-code","far fa-file-excel","far fa-file-image","far fa-file-pdf","far fa-file-powerpoint","far fa-file-video","far fa-file-word","far fa-flag","far fa-flushed","far fa-folder","far fa-folder-open","far fa-frown","far fa-frown-open","far fa-futbol","far fa-gem","far fa-grimace","far fa-grin","far fa-grin-alt","far fa-grin-beam","far fa-grin-beam-sweat","far fa-grin-hearts","far fa-grin-squint","far fa-grin-squint-tears","far fa-grin-stars","far fa-grin-tears","far fa-grin-tongue","far fa-grin-tongue-squint","far fa-grin-tongue-wink","far fa-grin-wink","far fa-hand-lizard","far fa-hand-paper","far fa-hand-peace","far fa-hand-point-down","far fa-hand-point-left","far fa-hand-point-right","far fa-hand-point-up","far fa-hand-pointer","far fa-hand-rock","far fa-hand-scissors","far fa-hand-spock","far fa-handshake","far fa-hdd","far fa-heart","far fa-hospital","far fa-hourglass","far fa-id-badge","far fa-id-card","far fa-image","far fa-images","far fa-keyboard","far fa-kiss","far fa-kiss-beam","far fa-kiss-wink-heart","far fa-laugh","far fa-laugh-beam","far fa-laugh-squint","far fa-laugh-wink","far fa-lemon","far fa-life-ring","far fa-lightbulb","far fa-list-alt","far fa-map","far fa-meh","far fa-meh-blank","far fa-meh-rolling-eyes","far fa-minus-square","far fa-money-bill-alt","far fa-moon","far fa-newspaper","far fa-object-group","far fa-object-ungroup","far fa-paper-plane","far fa-pause-circle","far fa-play-circle","far fa-plus-square","far fa-question-circle","far fa-registered","far fa-sad-cry","far fa-sad-tear","far fa-save","far fa-share-square","far fa-smile","far fa-smile-beam","far fa-smile-wink","far fa-snowflake","far fa-square","far fa-star","far fa-star-half","far fa-sticky-note","far fa-stop-circle","far fa-sun","far fa-surprise","far fa-thumbs-down","far fa-thumbs-up","far fa-times-circle","far fa-tired","far fa-trash-alt","far fa-user","far fa-user-circle","far fa-window-close","far fa-window-maximize","far fa-window-minimize","far fa-window-restore"];
        },

        actionSelect: function (data) {
            this.trigger('select', data.value);
        },

        getIconDataList: function () {
            var rowList = [];

            this.iconList.forEach(function (item, i) {
                if (i % 12 === 0) {
                    rowList.push([]);
                }
                rowList[rowList.length - 1].push(item);
            }, this);

            return rowList;
        },

        processQuickSearch: function (filter) {
            if (!filter) {
                this.$el.find('.icon-container').removeClass('hidden');

                return;
            }

            var $container = this.$el.find('.icons');

            this.iconList.forEach(function (item) {
                var $icon = this.itemCache[item];

                if (!$icon) {
                    $icon = $container.find('> .icon-container[data-name="' + item + '"]');

                    this.itemCache[item] = $icon;
                }

                if (~item.indexOf(filter)) {
                    $icon.removeClass('hidden');

                    return;
                }

                $icon.addClass('hidden');
            }.bind(this));
        },

    });
});

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

define('views/admin/entity-manager/modals/select-formula', ['views/modal'], function (Dep) {

    /**
     * @class
     * @name Class
     * @extends module:views/modal
     * @memberOf module:views/admin/entity-manager/modals/select-formula
     */
    return Dep.extend(/** @lends module:views/admin/entity-manager/modals/select-formula.Class# */{

        // language=Handlebars
        templateContent: `
            <div class="panel no-side-margin">
                <table class="table table-bordered">
                    {{#each typeList}}
                    <tr>
                        <td style="width: 40%">
                            <a
                                class="btn btn-default btn-lg btn-full-wide"
                                href="#Admin/entityManager/formula&scope={{../scope}}&type={{this}}"
                            >
                            {{translate this category='fields' scope='EntityManager'}}
                            </a>
                        </td>
                        <td style="width: 60%">
                            <div class="complex-text">{{complexText (translate this category='messages' scope='EntityManager')}}
                        </td>
                    </tr>
                    {{/each}}
                </table>
            </div>
        `,

        backdrop: true,

        data: function () {
            return {
                typeList: this.typeList,
                scope: this.scope,
            };
        },

        setup: function () {
            this.scope = this.options.scope;

            this.typeList = [
                'beforeSaveCustomScript',
                'beforeSaveApiScript',
            ];

            this.headerText = this.translate('Formula', 'labels', 'EntityManager')
        },
    });
});

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

define('views/admin/entity-manager/fields/icon-class', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        editTemplate: 'admin/entity-manager/fields/icon-class/edit',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.events['click [data-action="selectIcon"]'] = function () {
                this.selectIcon();
            };
        },

        selectIcon: function () {
            this.createView('dialog', 'views/admin/entity-manager/modals/select-icon', {}, view => {
                view.render();

                this.listenToOnce(view, 'select', value => {
                    if (value === '') {
                        value = null;
                    }

                    this.model.set(this.name, value);

                    view.close();
                });
            });
        },

        fetch: function () {
            let data = {};

            data[this.name] = this.model.get(this.name);

            return data;
        },
    });
});

define("views/admin/entity-manager/fields/duplicate-check-field-list", ["exports", "views/fields/multi-enum"], function (_exports, _multiEnum) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _multiEnum = _interopRequireDefault(_multiEnum);
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

  class DuplicateFieldListCheckEntityManagerFieldView extends _multiEnum.default {
    fieldTypeList = ['varchar', 'personName', 'email', 'phone', 'url', 'barcode'];
    setupOptions() {
      let entityType = this.model.get('name');
      let options = this.getFieldManager().getEntityTypeFieldList(entityType, {
        typeList: this.fieldTypeList,
        onlyAvailable: true
      }).sort((a, b) => {
        return this.getLanguage().translate(a, 'fields', this.entityType).localeCompare(this.getLanguage().translate(b, 'fields', this.entityType));
      });
      this.translatedOptions = {};
      options.forEach(item => {
        this.translatedOptions[item] = this.translate(item, 'fields', entityType);
      });
      this.params.options = options;
    }
  }
  var _default = DuplicateFieldListCheckEntityManagerFieldView;
  _exports.default = _default;
});

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

define('views/admin/dynamic-logic/modals/edit', ['views/modal'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/modals/edit',

        className: 'dialog dialog-record',

        data: function () {
            return {
            };
        },

        events: {

        },

        buttonList: [
            {
                name: 'apply',
                label: 'Apply',
                style: 'primary'
            },
            {
                name: 'cancel',
                label: 'Cancel'
            }
        ],

        setup: function () {
            this.conditionGroup = Espo.Utils.cloneDeep(this.options.conditionGroup || []);
            this.scope = this.options.scope;

            this.createView('conditionGroup', 'views/admin/dynamic-logic/conditions/and', {
                selector: '.top-group-container',
                itemData: {
                    value: this.conditionGroup
                },
                scope: this.options.scope
            });
        },

        actionApply: function () {
            var data = this.getView('conditionGroup').fetch();

            var conditionGroup = data.value;

            this.trigger('apply', conditionGroup);
            this.close();
        },
    });
});



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

define('views/admin/dynamic-logic/modals/add-field', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: `<div class="field" data-name="field">{{{field}}}</div>`,

        events: {
            'click a[data-action="addField"]': function (e) {
                this.trigger('add-field', $(e.currentTarget).data().name);
            },
        },

        setup: function () {
            this.header = this.translate('Add Field');
            this.scope = this.options.scope;

            const model = new Model();

            this.createView('field', 'views/admin/dynamic-logic/fields/field', {
                selector: '[data-name="field"]',
                model: model,
                mode: 'edit',
                scope: this.scope,
                defs: {
                    name: 'field',
                    params: {},
                },
            }, (view) => {
                this.listenTo(view, 'change', () => {
                    const list = model.get('field') || [];

                    if (!list.length) {
                        return;
                    }

                    this.trigger('add-field', list[0]);
                });
            });
        },
    });
});

define("views/admin/dynamic-logic/fields/user-id", ["exports", "views/fields/base"], function (_exports, _base) {
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

  class _default extends _base.default {
    detailTemplateContent = `
        <a href="#User/view/{{id}}">{{name}}</a>
    `;
    data() {
      return {
        id: this.model.get('$user.id'),
        name: this.model.get('name')
      };
    }
  }
  _exports.default = _default;
});

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

define('views/admin/dynamic-logic/fields/field', ['views/fields/multi-enum', 'ui/multi-select'],
function (Dep, /** module:ui/multi-select */MultiSelect) {

    return Dep.extend({

        getFieldList: function () {
            let fields = this.getMetadata().get('entityDefs.' + this.options.scope + '.fields');

            let filterList = Object.keys(fields).filter(field => {
                let fieldType = fields[field].type || null;

                if (
                    fields[field].disabled ||
                    fields[field].utility
                ) {
                    return;
                }

                if (!fieldType) {
                    return;
                }

                if (!this.getMetadata().get(['clientDefs', 'DynamicLogic', 'fieldTypes', fieldType])) {
                    return;
                }

                return true;
            });

            filterList.push('id');

            filterList.sort((v1, v2) => {
                return this.translate(v1, 'fields', this.options.scope)
                    .localeCompare(this.translate(v2, 'fields', this.options.scope));
            });

            return filterList;
        },

        setupTranslatedOptions: function () {
            this.translatedOptions = {};

            this.params.options.forEach(item => {
                this.translatedOptions[item] = this.translate(item, 'fields', this.options.scope);
            });
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = this.getFieldList();
            this.setupTranslatedOptions();
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.$element) {
                MultiSelect.focus(this.$element);
            }
        },
    });
});


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

define('views/admin/dynamic-logic/conditions-string/item-value-varchar',
['views/admin/dynamic-logic/conditions-string/item-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-base',

        createValueFieldView: function () {
            var key = this.getValueViewKey();

            var viewName = 'views/fields/varchar';

            this.createView('value', viewName, {
                model: this.model,
                name: this.field,
                selector: '[data-view-key="'+key+'"]',
            });
        },
    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-value-link',
['views/admin/dynamic-logic/conditions-string/item-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-base',

        createValueFieldView: function () {
            const key = this.getValueViewKey();

            const viewName = 'views/fields/link';

            this.createView('value', viewName, {
                model: this.model,
                name: 'link',
                selector: '[data-view-key="' + key + '"]',
                foreignScope: this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'entity']) ||
                    this.getMetadata().get(['entityDefs', this.scope, 'links', this.field, 'entity'])
            });
        },
    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-value-enum',
['views/admin/dynamic-logic/conditions-string/item-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-base',

        createValueFieldView: function () {
            var key = this.getValueViewKey();

            var viewName = 'views/fields/enum';

            this.createView('value', viewName, {
                model: this.model,
                name: this.field,
                selector: '[data-view-key="'+key+'"]',
                params: {
                    options: this.getMetadata()
                    .get(['entityDefs', this.scope, 'fields', this.field, 'options']) || []
                }
            });
        },
    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-multiple-values-base',
['views/admin/dynamic-logic/conditions-string/item-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/item-multiple-values-base',

        data: function () {
            return {
                valueViewDataList: this.valueViewDataList,
                scope: this.scope,
                operator: this.operator,
                operatorString: this.operatorString,
                field: this.field,
            };
        },

        populateValues: function () {
        },

        getValueViewKey: function (i) {
            return 'view-' + this.level.toString() + '-' + this.number.toString() + '-' + i.toString();
        },

        createValueFieldView: function () {
            var valueList = this.itemData.value || [];

            var fieldType = this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'type']) || 'base';
            var viewName = this.getMetadata().get(['entityDefs', this.scope, 'fields', this.field, 'view']) ||
                this.getFieldManager().getViewName(fieldType);

            this.valueViewDataList = [];

            valueList.forEach(function (value, i) {
                var model = this.model.clone();
                model.set(this.itemData.attribute, value);

                var key = this.getValueViewKey(i);

                this.valueViewDataList.push({
                    key: key,
                    isEnd: i === valueList.length - 1
                });

                this.createView(key, viewName, {
                    model: model,
                    name: this.field,
                    selector: '[data-view-key="'+key+'"]'
                });
            }, this);
        },
    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-is-today',
['views/admin/dynamic-logic/conditions-string/item-operator-only-date'], function (Dep) {

    return Dep.extend({

        dateValue: 'today',

    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-in-past',
['views/admin/dynamic-logic/conditions-string/item-operator-only-date'], function (Dep) {

    return Dep.extend({

        dateValue: 'past',
    });
});

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

define('views/admin/dynamic-logic/conditions-string/item-in-future',
['views/admin/dynamic-logic/conditions-string/item-operator-only-date'], function (Dep) {

    return Dep.extend({

        dateValue: 'future',
    });
});


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

define('views/admin/dynamic-logic/conditions-string/group-not',
['views/admin/dynamic-logic/conditions-string/group-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions-string/group-not',

        data: function () {
            return {
                viewKey: this.viewKey,
                operator: this.operator,
            };
        },

        setup: function () {
            this.level = this.options.level || 0;
            this.number = this.options.number || 0;
            this.scope = this.options.scope;

            this.operator = this.options.operator || this.operator;

            this.itemData = this.options.itemData || {};
            this.viewList = [];

            const i = 0;
            const key = 'view-' + this.level.toString() + '-' + this.number.toString() + '-' + i.toString();

            this.createItemView(i, key, this.itemData.value);
            this.viewKey = key;
        },
    });
});


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

define('views/admin/dynamic-logic/conditions/or', ['views/admin/dynamic-logic/conditions/group-base'], function (Dep) {

    return Dep.extend({

        operator: 'or',
    });
});

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

define('views/admin/dynamic-logic/conditions/not', ['views/admin/dynamic-logic/conditions/group-base'], function (Dep) {

    return Dep.extend({

        template: 'admin/dynamic-logic/conditions/not',

        operator: 'not',

        data: function () {
            return {
                viewKey: this.viewKey,
                operator: this.operator,
                hasItem: this.hasView(this.viewKey),
                level: this.level,
                groupOperator: this.getGroupOperator(),
            };
        },

        setup: function () {
            this.level = this.options.level || 0;
            this.number = this.options.number || 0;
            this.scope = this.options.scope;

            this.itemData = this.options.itemData || {};
            this.viewList = [];

            const i = 0;
            const key = this.getKey();

            this.createItemView(i, key, this.itemData.value);
            this.viewKey = key;
        },

        removeItem: function () {
            const key = this.getKey();

            this.clearView(key);

            this.controlAddItemVisibility();
        },

        getKey: function () {
            const i = 0;

            return 'view-' + this.level.toString() + '-' + this.number.toString() + '-' + i.toString();
        },

        getIndexForNewItem: function () {
            return 0;
        },

        addItemContainer: function () {},

        addViewDataListItem: function () {},

        fetch: function () {
            const view = this.getView(this.viewKey);

            if (!view) {
                return {
                    type: 'and',
                    value: [],
                };
            }

            const value = view.fetch();

            return {
                type: this.operator,
                value: value,
            };
        },

        controlAddItemVisibility: function () {
            if (this.getView(this.getKey())) {
                this.$el.find(' > .group-bottom').addClass('hidden');
            } else {
                this.$el.find(' > .group-bottom').removeClass('hidden');
            }
        },
    });
});

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

define('views/admin/dynamic-logic/conditions/and', ['views/admin/dynamic-logic/conditions/group-base'], function (Dep) {

    return Dep.extend({

        operator: 'and',
    });
});

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

define('views/admin/dynamic-logic/conditions/field-types/multi-enum',
['views/admin/dynamic-logic/conditions/field-types/base'], function (Dep) {

    return Dep.extend({

        fetch: function () {
            var valueView = this.getView('value');

            var item = {
                type: this.type,
                attribute: this.field
            };

            if (valueView) {
                valueView.fetchToModel();
                item.value = this.model.get(this.field);
            }

            return item;
        },

        getValueViewName: function () {
            var viewName = Dep.prototype.getValueViewName.call(this);

            if (~['has', 'notHas'].indexOf(this.type)) {
                viewName = 'views/fields/enum';
            }

            return viewName;
        },
    });
});

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

define('views/admin/dynamic-logic/conditions/field-types/link',
['views/admin/dynamic-logic/conditions/field-types/base'], function (Dep) {

    return Dep.extend({

        fetch: function () {
            var valueView = this.getView('value');

            var item = {
                type: this.type,
                attribute: this.field + 'Id',
                data: {
                    field: this.field
                }
            };

            if (valueView) {
                valueView.fetchToModel();
                item.value = this.model.get(this.field + 'Id');

                var values = {};
                values[this.field + 'Name'] = this.model.get(this.field + 'Name');
                item.data.values = values;
            }

            return item;
        },
    });
});

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

define('views/admin/dynamic-logic/conditions/field-types/link-parent',
['views/admin/dynamic-logic/conditions/field-types/base'], function (Dep) {

    return Dep.extend({

        fetch: function () {
            var valueView = this.getView('value');

            var item;

            if (valueView) {
                valueView.fetchToModel();
            }

            if (this.type === 'equals' || this.type === 'notEquals') {
                var values = {};

                values[this.field + 'Id'] = valueView.model.get(this.field + 'Id');
                values[this.field + 'Name'] = valueView.model.get(this.field + 'Name');
                values[this.field + 'Type'] = valueView.model.get(this.field + 'Type');

                if (this.type === 'equals') {
                    item = {
                        type: 'and',
                        value: [
                            {
                                type: 'equals',
                                attribute: this.field + 'Id',
                                value: valueView.model.get(this.field + 'Id')
                            },
                            {
                                type: 'equals',
                                attribute: this.field + 'Type',
                                value: valueView.model.get(this.field + 'Type')
                            }
                        ],
                        data: {
                            field: this.field,
                            type: 'equals',
                            values: values
                        }
                    };
                } else {
                    item = {
                        type: 'or',
                        value: [
                            {
                                type: 'notEquals',
                                attribute: this.field + 'Id',
                                value: valueView.model.get(this.field + 'Id')
                            },
                            {
                                type: 'notEquals',
                                attribute: this.field + 'Type',
                                value: valueView.model.get(this.field + 'Type')
                            }
                        ],
                        data: {
                            field: this.field,
                            type: 'notEquals',
                            values: values
                        }
                    };
                }
            } else {
                item = {
                    type: this.type,
                    attribute: this.field + 'Id',
                    data: {
                        field: this.field
                    }
                };
            }

            return item;
        },
    });
});

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

define('views/admin/dynamic-logic/conditions/field-types/enum',
['views/admin/dynamic-logic/conditions/field-types/base'], function (Dep) {

    return Dep.extend({

        fetch: function () {
            var valueView = this.getView('value');

            var item = {
                type: this.type,
                attribute: this.field,
            };

            if (valueView) {
                valueView.fetchToModel();
                item.value = this.model.get(this.field);
            }

            return item;
        },

        getValueViewName: function () {
            var viewName = Dep.prototype.getValueViewName.call(this);

            if (~['in', 'notIn'].indexOf(this.type)) {
                viewName = 'views/fields/multi-enum';
            }

            return viewName;
        },
    });
});

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

define('views/admin/dynamic-logic/conditions/field-types/date',
['views/admin/dynamic-logic/conditions/field-types/base'], function (Dep) {

    return Dep.extend({

    });
});

define("views/admin/dynamic-logic/conditions/field-types/current-user", ["exports", "views/admin/dynamic-logic/conditions/field-types/base", "model"], function (_exports, _base, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  _model = _interopRequireDefault(_model);
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

  class _default extends _base.default {
    getValueViewName() {
      return 'views/fields/user';
    }
    getValueFieldName() {
      return 'link';
    }
    createModel() {
      const model = new _model.default();
      model.setDefs({
        fields: {
          link: {
            type: 'link',
            entity: 'User'
          }
        }
      });
      return Promise.resolve(model);
    }
    populateValues() {
      if (this.itemData.attribute) {
        this.model.set('linkId', this.itemData.value);
      }
      const name = (this.additionalData.values || {}).name;
      this.model.set('linkName', name);
    }
    translateLeftString() {
      return '$' + this.translate('User', 'scopeNames');
    }
    fetch() {
      const valueView = this.getView('value');
      valueView.fetchToModel();
      return {
        type: this.type,
        attribute: '$user.id',
        data: {
          values: {
            name: this.model.get('linkName')
          }
        },
        value: this.model.get('linkId')
      };
    }
  }
  _exports.default = _default;
});

define("views/admin/dynamic-logic/conditions/field-types/current-user-teams", ["exports", "views/admin/dynamic-logic/conditions/field-types/link-multiple"], function (_exports, _linkMultiple) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _linkMultiple = _interopRequireDefault(_linkMultiple);
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

  class _default extends _linkMultiple.default {
    translateLeftString() {
      return '$' + this.translate('User', 'scopeNames') + '.' + super.translateLeftString();
    }
    fetch() {
      const data = super.fetch();
      data.attribute = '$user.teamsIds';
      return data;
    }
  }
  _exports.default = _default;
});

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

define('views/admin/complex-expression/modals/add-function', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'admin/formula/modals/add-function',

        fitHeight: true,

        backdrop: true,

        events: {
            'click [data-action="add"]': function (e) {
                this.trigger('add', $(e.currentTarget).data('value'));
            }
        },

        data: function () {
            var text = this.translate('formulaFunctions', 'messages', 'Admin')
                .replace('{documentationUrl}', this.documentationUrl);
            text = this.getHelper().transformMarkdownText(text, {linksInNewTab: true}).toString();

            return {
                functionDataList: this.functionDataList,
                text: text,
            };
        },

        setup: function () {
            this.header = this.translate('Function');

            this.documentationUrl = 'https://docs.espocrm.com/user-guide/complex-expressions/';

            this.functionDataList = this.options.functionDataList ||
                this.getMetadata().get('app.complexExpression.functionList') || [];
        },

    });
});

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

define('views/admin/authentication/fields/test-connection', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        templateContent: `
            <button
                class="btn btn-default"
                data-action="testConnection"
            >{{translate \'Test Connection\' scope=\'Settings\'}}</button>
        `,

        events: {
            'click [data-action="testConnection"]': function () {
                this.testConnection();
            },
        },

        fetch: function () {
            return {};
        },

        getConnectionData: function () {
            return {
                'host': this.model.get('ldapHost'),
                'port': this.model.get('ldapPort'),
                'useSsl': this.model.get('ldapSecurity'),
                'useStartTls': this.model.get('ldapSecurity'),
                'username': this.model.get('ldapUsername'),
                'password': this.model.get('ldapPassword'),
                'bindRequiresDn': this.model.get('ldapBindRequiresDn'),
                'accountDomainName': this.model.get('ldapAccountDomainName'),
                'accountDomainNameShort': this.model.get('ldapAccountDomainNameShort'),
                'accountCanonicalForm': this.model.get('ldapAccountCanonicalForm'),
            };
        },

        testConnection: function () {
            let data = this.getConnectionData();

            this.$el.find('button').prop('disabled', true);

            this.notify('Connecting', null, null, 'Settings');

            Espo.Ajax
                .postRequest('Ldap/action/testConnection', data)
                .then(() => {
                    this.$el.find('button').prop('disabled', false);

                    Espo.Ui.success(this.translate('ldapTestConnection', 'messages', 'Settings'));
                })
                .catch(xhr => {
                    let statusReason = xhr.getResponseHeader('X-Status-Reason') || '';
                    statusReason = statusReason.replace(/ $/, '');
                    statusReason = statusReason.replace(/,$/, '');

                    let msg = this.translate('Error') + ' ' + xhr.status;

                    if (statusReason) {
                        msg += ': ' + statusReason;
                    }

                    Espo.Ui.error(msg, true);

                    console.error(msg);

                    xhr.errorIsHandled = true;

                    this.$el.find('button').prop('disabled', false);
                });
        },
    });
});

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

define('views/admin/auth-token/list', ['views/list'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.menu.buttons = [];
        },

        getHeader: function () {
            return '<a href="#Admin">' + this.translate('Administration') + '</a>' +
                ' <span class="chevron-right"></span> ' +
                this.getLanguage().translate('Auth Tokens', 'labels', 'Admin');
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Auth Tokens', 'labels', 'Admin'));
        },
    });
});


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

define('views/admin/auth-token/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/admin/auth-token/record/row-actions/default',

        massActionList: ['remove', 'setInactive'],

        checkAllResultMassActionList: ['remove', 'setInactive'],

        massActionSetInactive: function () {
            let ids = null;
            let allResultIsChecked = this.allResultIsChecked;

            if (!allResultIsChecked) {
                ids = this.checkedList;
            }

            let attributes = {
                isActive: false,
            };

            Espo.Ajax
                .postRequest('MassAction', {
                    action: 'update',
                    entityType: this.entityType,
                    params: {
                        ids: ids || null,
                        where: (!ids || ids.length === 0) ? this.collection.getWhere() : null,
                        searchParams: (!ids || ids.length === 0) ? this.collection.data : null,
                    },
                    data: attributes,
                })
                .then(() => {
                    this.collection
                        .fetch()
                        .then(() => {
                            Espo.Ui.success(this.translate('Done'));

                            if (ids) {
                                ids.forEach(id => {
                                    this.checkRecord(id);
                                });
                            }
                        });
                });
        },

        actionSetInactive: function (data) {
            if (!data.id) {
                return;
            }

            var model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            model
                .save({'isActive': false}, {patch: true})
                .then(() => {
                    Espo.Ui.notify(false);
                });
        },
    });
});

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

define('views/admin/auth-token/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        sideDisabled: true,

        readOnly: true,
    });
});

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

define('views/admin/auth-token/record/detail-small', ['views/record/detail-small'], function (Dep) {

    return Dep.extend({

        sideDisabled: true,

        isWide: true,

        bottomView: 'views/record/detail-bottom',
    });
});

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

define('views/admin/auth-token/record/row-actions/default', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:isActive', () => {
                setTimeout(() => {
                    this.reRender();
                }, 10);
            });
        },

        getActionList: function () {
            var list = [];

            list.push({
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id
                }
            });

            if (this.model.get('isActive')) {
                list.push({
                    action: 'setInactive',
                    label: 'Set Inactive',
                    data: {
                        id: this.model.id
                    }
                });
            }

            list.push({
                action: 'quickRemove',
                label: 'Remove',
                data: {
                    id: this.model.id
                }
            });

            return list;
        },
    });
});

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

define('views/admin/auth-token/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        sideDisabled: true,

        editDisabled: true,
    });
});

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

define('views/admin/auth-log-record/list', ['views/list'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        getHeader: function () {
            return this.buildHeaderHtml([
                $('<a>')
                    .attr('href', '#Admin')
                    .text(this.translate('Administration')),
                $('<span>')
                    .text(this.getLanguage().translate('Auth Log', 'labels', 'Admin')),
            ]);
        },

        updatePageTitle: function () {
            this.setPageTitle(this.getLanguage().translate('Auth Log', 'labels', 'Admin'));
        },
    });
});

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

define('views/admin/auth-log-record/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/record/row-actions/view-and-remove',

        massActionList: ['remove'],

        checkAllResultMassActionList: ['remove'],
    });
});

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

define('views/admin/auth-log-record/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        sideDisabled: true,

        readOnly: true,
    });
});

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

define('views/admin/auth-log-record/record/detail-small', ['views/record/detail-small'], function (Dep) {

    return Dep.extend({

        sideDisabled: true,

        isWide: true,

        bottomView: 'views/record/detail-bottom',
    });
});

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

define('views/admin/auth-log-record/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        sideDisabled: true,

        editDisabled: true,
    });
});

define("controllers/role", ["exports", "controllers/record"], function (_exports, _record) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _record = _interopRequireDefault(_record);
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

  class RoleController extends _record.default {
    checkAccess(action) {
      if (this.getUser().isAdmin()) {
        return true;
      }
      return false;
    }
  }
  var _default = RoleController;
  _exports.default = _default;
});

define("controllers/portal-role", ["exports", "controllers/record"], function (_exports, _record) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _record = _interopRequireDefault(_record);
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

  class PortalRoleController extends _record.default {
    checkAccess(action) {
      if (this.getUser().isAdmin()) {
        return true;
      }
      return false;
    }
  }
  var _default = PortalRoleController;
  _exports.default = _default;
});

define("controllers/layout-set", ["exports", "controllers/record"], function (_exports, _record) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _record = _interopRequireDefault(_record);
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

  class LayoutSetController extends _record.default {
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {Record} options
     */
    actionEditLayouts(options) {
      const id = options.id;
      if (!id) {
        throw new Error("ID not passed.");
      }
      this.main('views/layout-set/layouts', {
        layoutSetId: id,
        scope: options.scope,
        type: options.type
      });
    }
  }
  var _default = LayoutSetController;
  _exports.default = _default;
});

define("controllers/inbound-email", ["exports", "controllers/record"], function (_exports, _record) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _record = _interopRequireDefault(_record);
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

  class InboundEmailController extends _record.default {
    checkAccess(action) {
      if (this.getUser().isAdmin()) {
        return true;
      }
      return false;
    }
  }
  var _default = InboundEmailController;
  _exports.default = _default;
});

define("controllers/api-user", ["exports", "controllers/record"], function (_exports, _record) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _record = _interopRequireDefault(_record);
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

  class ApiUserController extends _record.default {
    entityType = 'User';
    getCollection(usePreviouslyFetched) {
      return super.getCollection().then(collection => {
        collection.data.userType = 'api';
        return collection;
      });
    }

    /**
     * @protected
     * @param {Object} options
     * @param {module:models/user} model
     * @param {string} view
     */
    createViewView(options, model, view) {
      if (!model.isApi()) {
        if (model.isPortal()) {
          this.getRouter().dispatch('PortalUser', 'view', {
            id: model.id,
            model: model
          });
          return;
        }
        this.getRouter().dispatch('User', 'view', {
          id: model.id,
          model: model
        });
        return;
      }
      super.createViewView(options, model, view);
    }
    actionCreate(options) {
      options = options || {};
      options.attributes = options.attributes || {};
      options.attributes.type = 'api';
      super.actionCreate(options);
    }
  }
  var _default = ApiUserController;
  _exports.default = _default;
});

define("controllers/admin", ["exports", "controller", "search-manager", "views/settings/edit", "views/admin/index"], function (_exports, _controller, _searchManager, _edit, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _controller = _interopRequireDefault(_controller);
  _searchManager = _interopRequireDefault(_searchManager);
  _edit = _interopRequireDefault(_edit);
  _index = _interopRequireDefault(_index);
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

  class AdminController extends _controller.default {
    checkAccessGlobal() {
      if (this.getUser().isAdmin()) {
        return true;
      }
      return false;
    }

    // noinspection JSUnusedGlobalSymbols
    actionPage(options) {
      const page = options.page;
      if (options.options) {
        options = {
          ...Espo.Utils.parseUrlOptionsParam(options.options),
          ...options
        };
        delete options.options;
      }
      if (!page) {
        throw new Error();
      }
      const methodName = 'action' + Espo.Utils.upperCaseFirst(page);
      if (this[methodName]) {
        this[methodName](options);
        return;
      }
      const defs = this.getPageDefs(page);
      if (!defs) {
        throw new Espo.Exceptions.NotFound();
      }
      if (defs.view) {
        this.main(defs.view, options);
        return;
      }
      if (!defs.recordView) {
        throw new Espo.Exceptions.NotFound();
      }
      const model = this.getSettingsModel();
      model.fetch().then(() => {
        model.id = '1';
        const editView = new _edit.default({
          model: model,
          headerTemplate: 'admin/settings/headers/page',
          recordView: defs.recordView,
          page: page,
          label: defs.label,
          optionsToPass: ['page', 'label']
        });
        this.main(editView);
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionIndex(options) {
      let isReturn = options.isReturn;
      const key = this.name + 'Index';
      if (this.getRouter().backProcessed) {
        isReturn = true;
      }
      if (!isReturn && this.getStoredMainView(key)) {
        this.clearStoredMainView(key);
      }
      const view = new _index.default();
      this.main(view, null, view => {
        view.render();
        this.listenTo(view, 'clear-cache', this.clearCache);
        this.listenTo(view, 'rebuild', this.rebuild);
      }, {
        useStored: isReturn,
        key: key
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionUsers() {
      this.getRouter().dispatch('User', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPortalUsers() {
      this.getRouter().dispatch('PortalUser', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionApiUsers() {
      this.getRouter().dispatch('ApiUser', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionTeams() {
      this.getRouter().dispatch('Team', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionRoles() {
      this.getRouter().dispatch('Role', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPortalRoles() {
      this.getRouter().dispatch('PortalRole', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPortals() {
      this.getRouter().dispatch('Portal', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionLeadCapture() {
      this.getRouter().dispatch('LeadCapture', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionEmailFilters() {
      this.getRouter().dispatch('EmailFilter', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionGroupEmailFolders() {
      this.getRouter().dispatch('GroupEmailFolder', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionEmailTemplates() {
      this.getRouter().dispatch('EmailTemplate', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPdfTemplates() {
      this.getRouter().dispatch('Template', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionDashboardTemplates() {
      this.getRouter().dispatch('DashboardTemplate', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionWebhooks() {
      this.getRouter().dispatch('Webhook', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionLayoutSets() {
      this.getRouter().dispatch('LayoutSet', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionWorkingTimeCalendar() {
      this.getRouter().dispatch('WorkingTimeCalendar', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionAttachments() {
      this.getRouter().dispatch('Attachment', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionAuthenticationProviders() {
      this.getRouter().dispatch('AuthenticationProvider', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionEmailAddresses() {
      this.getRouter().dispatch('EmailAddress', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPhoneNumbers() {
      this.getRouter().dispatch('PhoneNumber', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPersonalEmailAccounts() {
      this.getRouter().dispatch('EmailAccount', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionGroupEmailAccounts() {
      this.getRouter().dispatch('InboundEmail', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionActionHistory() {
      this.getRouter().dispatch('ActionHistoryRecord', 'list', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionImport() {
      this.getRouter().dispatch('Import', 'index', {
        fromAdmin: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionLayouts(options) {
      const scope = options.scope || null;
      const type = options.type || null;
      const em = options.em || false;
      this.main('views/admin/layouts/index', {
        scope: scope,
        type: type,
        em: em
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionLabelManager(options) {
      const scope = options.scope || null;
      const language = options.language || null;
      this.main('views/admin/label-manager/index', {
        scope: scope,
        language: language
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionTemplateManager(options) {
      const name = options.name || null;
      this.main('views/admin/template-manager/index', {
        name: name
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionFieldManager(options) {
      const scope = options.scope || null;
      const field = options.field || null;
      this.main('views/admin/field-manager/index', {
        scope: scope,
        field: field
      });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {Record} options
     */
    actionEntityManager(options) {
      const scope = options.scope || null;
      if (scope && options.edit) {
        this.main('views/admin/entity-manager/edit', {
          scope: scope
        });
        return;
      }
      if (options.create) {
        this.main('views/admin/entity-manager/edit');
        return;
      }
      if (scope && options.formula) {
        this.main('views/admin/entity-manager/formula', {
          scope: scope,
          type: options.type
        });
        return;
      }
      if (scope) {
        this.main('views/admin/entity-manager/scope', {
          scope: scope
        });
        return;
      }
      this.main('views/admin/entity-manager/index');
    }

    // noinspection JSUnusedGlobalSymbols
    actionLinkManager(options) {
      const scope = options.scope || null;
      this.main('views/admin/link-manager/index', {
        scope: scope
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionSystemRequirements() {
      this.main('views/admin/system-requirements/index');
    }

    /**
     * @returns {module:models/settings}
     */
    getSettingsModel() {
      const model = this.getConfig().clone();
      model.defs = this.getConfig().defs;
      this.listenTo(model, 'after:save', () => {
        this.getConfig().load();
        this._broadcastChannel.postMessage('update:config');
      });

      // noinspection JSValidateTypes
      return model;
    }

    // noinspection JSUnusedGlobalSymbols
    actionAuthTokens() {
      this.collectionFactory.create('AuthToken', collection => {
        const searchManager = new _searchManager.default(collection, 'list', this.getStorage(), this.getDateTime());
        searchManager.loadStored();
        collection.where = searchManager.getWhere();
        collection.maxSize = this.getConfig().get('recordsPerPage') || collection.maxSize;
        this.main('views/admin/auth-token/list', {
          scope: 'AuthToken',
          collection: collection,
          searchManager: searchManager
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionAuthLog() {
      this.collectionFactory.create('AuthLogRecord', collection => {
        const searchManager = new _searchManager.default(collection, 'list', this.getStorage(), this.getDateTime());
        searchManager.loadStored();
        collection.where = searchManager.getWhere();
        collection.maxSize = this.getConfig().get('recordsPerPage') || collection.maxSize;
        this.main('views/admin/auth-log-record/list', {
          scope: 'AuthLogRecord',
          collection: collection,
          searchManager: searchManager
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionJobs() {
      this.collectionFactory.create('Job', collection => {
        const searchManager = new _searchManager.default(collection, 'list', this.getStorage(), this.getDateTime());
        searchManager.loadStored();
        collection.where = searchManager.getWhere();
        collection.maxSize = this.getConfig().get('recordsPerPage') || collection.maxSize;
        this.main('views/admin/job/list', {
          scope: 'Job',
          collection: collection,
          searchManager: searchManager
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionIntegrations(options) {
      const integration = options.name || null;
      this.main('views/admin/integrations/index', {
        integration: integration
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionExtensions() {
      this.main('views/admin/extensions/index');
    }
    rebuild() {
      if (this.rebuildRunning) {
        return;
      }
      this.rebuildRunning = true;
      const master = this.get('master');
      Espo.Ui.notify(master.translate('pleaseWait', 'messages'));
      Espo.Ajax.postRequest('Admin/rebuild').then(() => {
        const msg = master.translate('Rebuild has been done', 'labels', 'Admin');
        Espo.Ui.success(msg);
        this.rebuildRunning = false;
      }).catch(() => {
        this.rebuildRunning = false;
      });
    }
    clearCache() {
      if (this.clearCacheRunning) {
        return;
      }
      this.clearCacheRunning = true;
      const master = this.get('master');
      Espo.Ui.notify(master.translate('pleaseWait', 'messages'));
      Espo.Ajax.postRequest('Admin/clearCache').then(() => {
        const msg = master.translate('Cache has been cleared', 'labels', 'Admin');
        Espo.Ui.success(msg);
        this.clearCacheRunning = false;
      }).catch(() => {
        this.clearCacheRunning = false;
      });
    }

    /**
     * @returns {Object|null}
     */
    getPageDefs(page) {
      const panelsDefs = this.getMetadata().get(['app', 'adminPanel']) || {};
      let resultDefs = null;
      for (const panelKey in panelsDefs) {
        const itemList = panelsDefs[panelKey].itemList || [];
        for (const defs of itemList) {
          if (defs.url === '#Admin/' + page) {
            resultDefs = defs;
            break;
          }
        }
        if (resultDefs) {
          break;
        }
      }
      return resultDefs;
    }
  }
  var _default = AdminController;
  _exports.default = _default;
});

