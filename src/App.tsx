import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query/build/lib/useInfiniteQuery";
import { useQueries } from "@tanstack/react-query/build/lib/useQueries";

export interface PostProps {
  id: string;
  title: string;
}

const POSTS: PostProps[] = [
  { id: "1", title: "Post 1" },
  { id: "2", title: "Post 2" },
];

// to start, install react-query and react-query-devtools

//query is a function to fetch data
//mutation is a function to update data

// strategic query key
// /posts -> ["posts"]
// /posts/1 -> ["posts", 1]
// /posts?authorId=1 -> ["posts", { authorId: 1 }]
// /posts/2/comments -> ["posts", 2, "comments"]

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function App() {
  const queryClient = useQueryClient();

  //queryFn always returns a promise
  const postQuery = useQuery({
    // when using invalidate Queries, you have to wachout for the query key.
    //every query key that start with "posts" will be invalidated
    //that's why when calling invalidate queries, you have to pass the exact query key
    queryKey: ["posts"],
    // keepPreviousData: true,  will keep the previous data while fetching new data
    //you can use axios or fetch for query function
    queryFn: (obj) =>
      wait(1000).then(() => {
        console.log(obj); // if you pass an object as query key, it will be passed as an argument to queryFn
        return [...POSTS];
      }),
    initialData: {}, // initial data to be used before the query is executed, BUT react-query will thinks this data as fresh data if we seet the staleTime
    placeholderData: {}, // will be used as initial data, but react-query will thinks this data as stale data if we set the staleTime (in short: immediately overwritten by the fresh data)
    //function bellow for testing error
    // queryFn: () => Promise.reject("error message"),

    //refetchInterval: 1000 -> will refetch every 1 second
    // refetchInterval: 1000,

    // enable -> if false, query will not be executed. useful when the query depends on some other query
  });

  //useInfiniteQuery is used for querying paginated data
  // useInfiniteQuery will return an object with data, error, isLoading, isFetching, isFetchingMore, fetchMore, canFetchMore, refetch, remove

  const {} = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: () => {},
    getNextPageParam: (prevData) => {},
  });

  // useQueries allows you to run multiple queries at the same time
  // useQueries accepts an array of objects

  // const {} = useQueries(
  //   new Array(10).map((item) => {
  //     return {
  //       queryKey: ["posts", item],
  //       queryFn: () => {},
  //     };
  //   })
  // );

  const newPostMutation = useMutation({
    //this function can take any arguments
    mutationFn: (title: string) =>
      wait(1000).then(() => POSTS.push({ id: crypto.randomUUID(), title })),
    onSuccess: (data, variables, context) => {
      // queryClient.invalidateQueries(["posts"], { exact: true }); -> will invalidate only the query with the exact query key
      queryClient.invalidateQueries(["posts"]);

      // setQueryData will update the data in the cache (this one set manually)
      // options to use setQueryData:
      // option 1
      // queryClient.setQueryData(["posts", data.id], data);

      //option 2
      // queryClient.setQueryData(["posts"], (oldData) => {})
    },
    // onSettled is like finally
    onSettled(data, error, variables, context) {},
    //onMutate is called before mutationFn
    // onMutate can also passing context
    onMutate(variables) {},
    // retry: 3 -> will retry 3 times
  });

  console.log(POSTS);

  /* PREFETCHING */
  // for prefetching, we can use useQueryClient's prefetchQuery
  // prefetchQuery will not return any data, it will just fetch the data and store it in the cache

  // const queryClient = useQueryClient();
  // queryClient.prefetchQuery({
  //   queryKey: ["posts"], // query key to prefetch
  // });

  if (postQuery.isLoading) {
    return <div>Loading...</div>;
  } else if (postQuery.isError) {
    return <div>{postQuery.error as string}</div>;
  }

  return (
    <div className="App">
      {postQuery.data.map((item) => (
        <div key={item.id}>
          <h1>{item.title}</h1>
        </div>
      ))}

      <button
        disabled={newPostMutation.isLoading}
        onClick={() => newPostMutation.mutate("New Post")}
      >
        Add new{" "}
      </button>
    </div>
  );
}

export default App;
