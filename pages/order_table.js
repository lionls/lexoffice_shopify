import {
  Layout,
  Page,
  FooterHelp,
  Card,
  Link,
  Button,
  FormLayout,
  TextField,
  AccountConnection,
  ChoiceList,
  SettingToggle,
  Avatar,
  DataTable,
  TextStyle,
  Filters,
  ResourceItem,
  ResourceList,
} from "@shopify/polaris";
//import {ResourceItem,ResourceList} from "./polaris";
import React, { useState, useCallback } from "react";

export default function OrderTable() {
  function DataTableExample() {
    const rows = [
      ["Emerald Silk Gown", "$875.00", 124689, 140, "$122,500.00"],
      ["Mauve Cashmere Scarf", "$230.00", 124533, 83, "$19,090.00"],
      [
        "Navy Merino Wool Blazer with khaki chinos and yellow belt",
        "$445.00",
        124518,
        32,
        "$14,240.00",
      ],
    ];

    return (
      <Page title="Sales by product">
        <Card>
          <DataTable
            columnContentTypes={[
              "text",
              "numeric",
              "numeric",
              "numeric",
              "numeric",
            ]}
            headings={[
              "Order Number",
              "Price",
              "SKU Number",
              "Net quantity",
              "Net sales",
            ]}
            rows={rows}
            totals={["", "", "", 255, "$155,830.00"]}
          />
        </Card>
      </Page>
    );
  }
  return <DataTableExample />;
}
