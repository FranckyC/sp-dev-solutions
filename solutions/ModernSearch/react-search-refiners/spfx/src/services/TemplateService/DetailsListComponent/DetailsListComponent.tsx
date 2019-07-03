import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { ISearchResult } from '../../../models/ISearchResult';
import * as Handlebars from 'handlebars';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';

const classNames = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px'
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden'
      }
    }
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px'
  },
  controlWrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  exampleToggle: {
    display: 'inline-block',
    marginBottom: '10px',
    marginRight: '30px'
  },
  selectionDetails: {
    marginBottom: '20px'
  }
});
const controlStyles = {
  root: {
    margin: '0 30px 20px 0',
    maxWidth: '300px'
  }
};

export interface IDetailsListColumnConfiguration{
  name: string;
  value: string;
  maxWidth: string;
  minWidth: string;
  enableSorting: boolean;
  isResizable: boolean;
  isMultiline: boolean;
  isResultItemLink: boolean;
}

export interface DetailsListComponentProps {
    items?: string;
    columnsConfiguration?: string;
    showFileIcon?: boolean;
    enableFiltering?: boolean;

    /**
     * If true, the details list shimers are displayed
     */
    showShimmers?: boolean;
}

export interface IDetailsListComponentState {
  columns: IColumn[];
  items: ISearchResult[];
  isCompactMode: boolean;
}

export class DetailsListComponent extends React.Component<DetailsListComponentProps, IDetailsListComponentState> {
  private _allItems: ISearchResult[];

  constructor(props: DetailsListComponentProps) {
    super(props);

    this._allItems = this.props.items ? JSON.parse(this.props.items) : [];

    const columns: IColumn[] = [
    ];

    // Show file icon pption
    if (this.props.showFileIcon) {
      columns.push(
        {
          key: 'column1',
          name: 'File Type',
          className: classNames.fileIconCell,
          iconClassName: classNames.fileIconHeaderIcon,
          ariaLabel: 'Column operations for File type, Press to sort on File type',
          iconName: 'Page',
          isIconOnly: true,
          fieldName: 'IconSrc',
          minWidth: 16,
          maxWidth: 16,
          onColumnClick: this._onColumnClick,
          onRender: (item: ISearchResult) => {
            return <img src={item.IconSrc} className={classNames.fileIconImg} alt={item.fileType + ' file icon'} />;
          }
        }
      );
    }

    // Build columns dynamically
    if (this.props.columnsConfiguration) {
      JSON.parse(this.props.columnsConfiguration).map((column: IDetailsListColumnConfiguration) => {
        columns.push(
          {
            key: column.name,
            name: column.name,
            fieldName: column.value,
            minWidth: parseInt(column.minWidth),
            maxWidth: parseInt(column.maxWidth),
            isRowHeader: true,
            isResizable: column.isResizable === true,
            isMultiline: column.isMultiline === true,
            isSorted: column.enableSorting === true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: column.enableSorting ? this._onColumnClick : null,
            data: 'string',
            isPadded: true,
            onRender: (item: ISearchResult) => {

              let value: any = item[column.value];
              let renderColumnValue: JSX.Element = null;
              let hasError: boolean = false;

              // Check if the value in an Handlebars expression
              if (/\{\{([^}]+)\}\}/.test(column.value)) {

                try {
                  // Create a temp context with the current so we cab use global registered helper on the current item
                  const tempTemplateContent = `
                    {{#with item as |item|}}
                      ${column.value}
                    {{/with}}
                  `;

                  let template = Handlebars.compile(tempTemplateContent);

                  // Pass the current item as context
                  value = template({
                    item: item
                  });

                  value = value ? value.trim() : null;
                  
                } catch (error) {
                  hasError = true;
                  value = `<span style="color:red;font-style: italic">${`Error: ${error.message}`}</span>`;
                }
              }

              renderColumnValue = <span title={!hasError ? value : ''} dangerouslySetInnerHTML={{ __html: value }}></span>;

              // Make the value clickable to the corresponding result item 
              if (column.isResultItemLink) {
                renderColumnValue = <a href={item.ServerRedirectedURL ? item.ServerRedirectedURL : item.Path}>{renderColumnValue}</a>;
              }
            
              return renderColumnValue;
            },
          },
        )
      });
    }
      
    this.state = {
      items: this._allItems,
      columns: columns,
      isCompactMode: false
    };
  }

  public render() {
    const { columns, isCompactMode, items } = this.state;

    let renderFilter: JSX.Element = null;

    if (this.props.enableFiltering) {
      renderFilter = <div className={classNames.controlWrapper}>
        <TextField label="Filter by name:" onChange={this._onChangeText.bind(this)} styles={controlStyles} />
      </div>
    }

    return (
      <Fabric>
        {renderFilter}
          <ShimmeredDetailsList
            items={items}
            compact={isCompactMode}
            columns={columns}
            selectionMode={SelectionMode.none}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            enableShimmer={this.props.showShimmers}
            selectionPreservedOnEmptyClick={true}
            enterModalSelectionOnTouch={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
          />
      </Fabric>
    );
  }

  private _onChangeText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    this.setState({
      items: text ? this._allItems.filter(i => i.Title.toLowerCase().indexOf(text) > -1) : this._allItems
    });
  };

  private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns, items } = this.state;
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
    this.setState({
      columns: newColumns,
      items: newItems
    });
  };
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
  const key = columnKey as keyof T;
  return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}