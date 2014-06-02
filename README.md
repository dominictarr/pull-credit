# pull-credit

credit based control flow for pull streams.

inspiration: http://250bpm.com/blog:22 http://hintjens.com/blog:15

connect two pull streams, but control the rate of flow between them.

A debtor "borrows" from a creditor's buffer.
A debtor streams binary chunks to a creditor, when they are read from
the creditor, a credit is issued to the debtor, who may stream more data.

## License

MIT
