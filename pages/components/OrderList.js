import gql from "graphql-tag";
import { Query } from "react-apollo";
import React, { useState, useCallback } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Context } from "@shopify/app-bridge-react";
import {
  Button,
  Page,
  Stack,
  DataTable,
  Card,
  TextStyle,
  Subheading,
  Spinner,
  DisplayText,
  Heading,
  TextContainer,
} from "@shopify/polaris";
import { useQuery } from "@apollo/react-hooks";
import axios from "axios";
var _ = require("lodash");
var fileDownload = require('js-file-download');

const GET_MORE_FULLFILLMENT_ORDERS = gql`
  query get_fullfilmments($cursor: String) {
    shop {
      fulfillmentOrders(first: 200, after: $cursor) {
        edges {
          cursor
          node {
            id
            order {
              email
              name
              shippingAddress {
                name
                address1
                address2
                city
                zip
                company
                country
                firstName
                lastName
                formatted
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

function OrderList() {
  const { data, loading, fetchMore } = useQuery(GET_MORE_FULLFILLMENT_ORDERS, {
    variables: { cursor: null },
    notifyOnNetworkStatusChange: true,
  });

  return (
    <OrderListTable
      entries={loading ? [] : data.shop.fulfillmentOrders || []}
      loading={loading}
      onLoadMore={() =>
        fetchMore({
          variables: {
            cursor: loading
              ? null
              : data.shop.fulfillmentOrders.edges[
                  data.shop.fulfillmentOrders.edges.length - 1
                ].cursor,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            console.log("more");

            console.log(fetchMoreResult);
            const newEdges = fetchMoreResult.shop.fulfillmentOrders.edges;
            const pageInfo = fetchMoreResult.shop.fulfillmentOrders.pageInfo;
            return newEdges.length
              ? {
                  // Put the new comments at the end of the list and update `pageInfo`
                  // so we have the new `endCursor` and `hasNextPage` values
                  shop: {
                    fulfillmentOrders: {
                      __typename:
                        previousResult.shop.fulfillmentOrders.__typename,
                      edges: [
                        ...previousResult.shop.fulfillmentOrders.edges,
                        ...newEdges,
                      ],
                      pageInfo,
                    },
                  },
                }
              : previousResult;
          },
        })
      }
    />
  );
}

class OrderListTable extends React.Component {
  static contextType = Context;

  render() {
    const app = this.context;
    var table = [];

    function stringToBytes(text) {
      const length = text.length;
      const result = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        const code = text.charCodeAt(i);
        const byte = code > 255 ? 32 : code;
        result[i] = byte;
      }
      return result;
    }

    const getHermes = async () => {
      const request_object = {
        orders: this.props.entries.edges.map((n) => n.node),
      };
      const response = await axios.post("/parse/hermes", request_object);
      var date = new Date().toISOString().slice(0, 10).replace(/-/g, "_");

      const bytes = stringToBytes(response.data);
      const blob = new Blob([bytes.buffer], { type: 'text/plain; charset=ISO-8859-1' });

      fileDownload(blob, "hermes_" + date + ".csv");
    };

    if (!this.props.loading) {
      table = this.props.entries.edges.map((n) => [
        n.node.order.name,
        n.node.order.shippingAddress.name,
        n.node.order.shippingAddress.formatted[0] +
          " " +
          n.node.order.shippingAddress.formatted[1],
      ]); //[_.map(this.props.entries.edges, 'node.order.name'),_.map(this.props.entries.edges, 'node.order.shippingAddress.name'),_.map(this.props.entries.edges, 'node.order.shippingAddress.formatted')]
      if (this.props.entries.pageInfo.hasNextPage) {
        this.props.onLoadMore().then((out, err) => {});
      }
    }

    return (
      <Page title="Fulfillable Orders" fullWidth={true} spacing="loose">
        <TextContainer>
          <TextContainer spacing="loose">
            <Button onClick={() => getHermes()} primary>
              Export Hermes CSV
            </Button>
          </TextContainer>
          <Card
            spacing="loose"
            title={"Total Fulfillable Orders: " + table.length}
          >
            {this.props.loading ? (
              <Stack spacing="loose" distribution="center">
                <Spinner
                  accessibilityLabel="Spinner example"
                  size="large"
                  color="teal"
                />{" "}
                <DisplayText size="medium">
                  Loading fulfillable Orders
                </DisplayText>
              </Stack>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "text"]}
                headings={["Order Number", "Name", "Shipping Address"]}
                rows={table}
                spacing="loose"
              />
            )}
          </Card>
          <Button onClick={() => getHermes()} primary>
            Export Hermes CSV
          </Button>
        </TextContainer>
      </Page>
    );
  }
}

// class OrderList extends React.Component {
//     static contextType = Context;

//     render() {
//       const app = this.context;

//       // const { data: { orders, cursor }, loading, fetchMore } = useQuery(
//       //   GET_MORE_FULLFILLMENT_ORDERS
//       // );

//       return (
//         <Query query={GET_ORDERS}  >
//           {({ data, loading, error }) => {
//             if (loading) { return <div>Loading…</div>; }
//             if (error) { return <div>{error.message}</div>; }
//             console.log(data);
//             return (
//               <div>{JSON.stringify(data)}
//               <Button onClick={() => convertToHermes(data)}>Create Hermes CSV</Button></div>
//             );
//           }}
//         </Query>
//       );
//     }
//   }

export default OrderList;
