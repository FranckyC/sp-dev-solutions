import * as React from "react";
import { TaxonomyPicker, IPickerTerms  } from "@pnp/spfx-controls-react";
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';
import { IWebPartContext } from "@microsoft/sp-webpart-base";

export interface ITaxonomyFilteremplateProps extends IBaseRefinerTemplateProps {
    context: IWebPartContext;
}

export default class TaxonomyFilterTemplate extends React.Component<ITaxonomyFilteremplateProps, IBaseRefinerTemplateState> {   

    public constructor(props: ITaxonomyFilteremplateProps) {
        super(props);

        this.state = {
            refinerSelectedFilterValues: []
        };
    }

    public render() {

        const renderPicker = <TaxonomyPicker allowMultipleSelections={true}
                                termsetNameOrID="Cote"
                                panelTitle="Select Term"
                                label=""

                                includeDefaultTermActions={true}
                                context={this.props.context}
                                onChange={this.onTaxPickerChange}
                                isTermSetSelectable={false} />;

        return renderPicker;
    }

    private onTaxPickerChange(terms : IPickerTerms) {
        console.log("Terms", terms);
    }
}